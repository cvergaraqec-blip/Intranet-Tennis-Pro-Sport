-- Inventario de la tienda
create table public.productos (
  id bigint generated always as identity primary key,
  codigo text not null default '',
  nombre text not null,
  categoria text not null default 'Accesorios y Pelotas'
    check (categoria in ('Raquetas', 'Cordajes', 'Grips', 'Accesorios y Pelotas')),
  variante text not null default '',
  stock integer not null default 0 check (stock >= 0),
  minimo integer not null default 1 check (minimo >= 0),
  creado_en timestamptz not null default now()
);

alter table public.productos enable row level security;

create policy "personal ve productos" on public.productos
  for select to authenticated using (true);

create policy "admin crea productos" on public.productos
  for insert to authenticated with check (public.es_admin());

create policy "admin edita productos" on public.productos
  for update to authenticated using (public.es_admin());

create policy "admin borra productos" on public.productos
  for delete to authenticated using (public.es_admin());

-- Cualquier miembro del personal puede sumar o restar stock en el mostrador,
-- pero solo a través de esta función (no puede editar el resto del producto).
create or replace function public.ajustar_stock(p_id bigint, p_delta integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  nuevo integer;
begin
  if auth.uid() is null then
    raise exception 'no autenticado';
  end if;

  update public.productos
    set stock = greatest(stock + p_delta, 0)
    where id = p_id
    returning stock into nuevo;

  return nuevo;
end;
$$;

revoke execute on function public.ajustar_stock(bigint, integer) from public, anon;
grant execute on function public.ajustar_stock(bigint, integer) to authenticated;

-- Turnos del personal
create table public.turnos (
  id bigint generated always as identity primary key,
  empleado_id uuid not null references public.perfiles (id) on delete cascade,
  fecha date not null,
  inicio time not null,
  fin time not null check (fin > inicio),
  creado_en timestamptz not null default now()
);

create index turnos_fecha_idx on public.turnos (fecha);

alter table public.turnos enable row level security;

create policy "ver turnos propios o admin ve todos" on public.turnos
  for select to authenticated using (empleado_id = auth.uid() or public.es_admin());

create policy "admin gestiona turnos" on public.turnos
  for all to authenticated using (public.es_admin()) with check (public.es_admin());
