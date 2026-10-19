-- Ficha de cada empleado. No necesita cuenta para tener turnos; si su
-- correo coincide con una cuenta, al entrar ve sus propios turnos.
create table public.empleados (
  id bigint generated always as identity primary key,
  numero text not null unique check (numero ~ '^[0-9]{4}$'),
  nombre text not null check (length(trim(nombre)) > 0),
  apellido text not null check (length(trim(apellido)) > 0),
  telefono text not null default '',
  email text unique,
  creado_en timestamptz not null default now()
);

alter table public.empleados enable row level security;

create policy "ver ficha propia o admin ve todas" on public.empleados
  for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email') or public.es_admin());

create policy "admin gestiona empleados" on public.empleados
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- Los turnos pasan a apuntar a la ficha del empleado.
alter table public.turnos add column ficha_id bigint references public.empleados (id) on delete cascade;

-- Cada cuenta que ya tenía turnos recibe una ficha con número correlativo.
insert into public.empleados (numero, nombre, apellido, email)
select
  lpad((row_number() over (order by u.created_at))::text, 4, '0'),
  split_part(p.nombre, ' ', 1),
  coalesce(nullif(substr(p.nombre, length(split_part(p.nombre, ' ', 1)) + 2), ''), '-'),
  u.email
from public.perfiles p
join auth.users u on u.id = p.id
where exists (select 1 from public.turnos t where t.empleado_id = p.id);

update public.turnos t
set ficha_id = e.id
from auth.users u, public.empleados e
where u.id = t.empleado_id and lower(e.email) = lower(u.email);

-- La columna antigua queda guardada como perfil_antiguo, sin uso.
alter table public.turnos alter column empleado_id drop not null;
alter table public.turnos rename column empleado_id to perfil_antiguo;
alter table public.turnos rename column ficha_id to empleado_id;
alter table public.turnos alter column empleado_id set not null;

alter policy "ver turnos propios o admin ve todos" on public.turnos
  using (
    public.es_admin()
    or exists (
      select 1 from public.empleados e
      where e.id = turnos.empleado_id and lower(e.email) = lower(auth.jwt() ->> 'email')
    )
  );
