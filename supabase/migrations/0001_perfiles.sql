-- Perfiles de usuario con rol (administrador o empleado).
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null default '',
  rol text not null default 'empleado' check (rol in ('admin', 'empleado')),
  creado_en timestamptz not null default now()
);

alter table public.perfiles enable row level security;

-- security definer evita recursión con las políticas de la propia tabla
create or replace function public.es_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;

create policy "ver propio perfil o admin ve todos" on public.perfiles
  for select using (id = auth.uid() or public.es_admin());

create policy "admin actualiza perfiles" on public.perfiles
  for update using (public.es_admin());

-- Crea el perfil automáticamente al registrar un usuario.
-- El primer usuario queda como admin; los siguientes como empleado.
create or replace function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    case when exists (select 1 from public.perfiles) then 'empleado' else 'admin' end
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();
