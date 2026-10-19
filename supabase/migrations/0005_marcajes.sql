-- Reloj marcador: cada entrada o salida de un empleado.
create table public.marcajes (
  id bigint generated always as identity primary key,
  empleado_id bigint not null references public.empleados (id) on delete cascade,
  tipo text not null check (tipo in ('entrada', 'salida')),
  momento timestamptz not null default now()
);

create index marcajes_momento_idx on public.marcajes (momento);

alter table public.marcajes enable row level security;

create policy "ver marcas propias o admin ve todas" on public.marcajes
  for select to authenticated
  using (
    public.es_admin()
    or exists (
      select 1 from public.empleados e
      where e.id = marcajes.empleado_id and lower(e.email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy "admin gestiona marcas" on public.marcajes
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- Marca con el número de 4 dígitos; devuelve el nombre o null si no existe.
create or replace function public.marcar(p_numero text, p_tipo text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
  v_nombre text;
begin
  if p_tipo not in ('entrada', 'salida') then
    return null;
  end if;

  select id, nombre || ' ' || apellido into v_id, v_nombre
  from empleados where numero = p_numero;
  if v_id is null then
    return null;
  end if;

  insert into marcajes (empleado_id, tipo) values (v_id, p_tipo);
  return v_nombre;
end;
$$;

revoke execute on function public.marcar(text, text) from public, anon;
grant execute on function public.marcar(text, text) to authenticated;
