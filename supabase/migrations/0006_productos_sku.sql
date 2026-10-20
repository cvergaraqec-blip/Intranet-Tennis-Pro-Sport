-- Color, talla y UPC por producto. La columna codigo pasa a ser el SKU.
alter table public.productos
  add column color text not null default '',
  add column talla text not null default '',
  add column upc text not null default '';

create unique index productos_sku_unico on public.productos (codigo) where codigo <> '';

-- Carga masiva: inserta o actualiza por SKU. Solo administradores.
create or replace function public.importar_productos(filas jsonb)
returns table (insertados int, actualizados int)
language plpgsql
security definer
set search_path = public
as $$
declare
  f jsonb;
  v_sku text;
  v_id bigint;
  v_categoria text;
begin
  if not public.es_admin() then
    raise exception 'solo administradores';
  end if;

  insertados := 0;
  actualizados := 0;

  for f in select * from jsonb_array_elements(filas) loop
    v_sku := trim(coalesce(f ->> 'sku', ''));
    v_categoria := coalesce(nullif(f ->> 'categoria', ''), 'Accesorios y Pelotas');
    v_id := null;
    if v_sku <> '' then
      select id into v_id from productos where codigo = v_sku;
    end if;

    if v_id is null then
      insert into productos (codigo, nombre, categoria, color, talla, upc, stock, minimo)
      values (
        v_sku,
        f ->> 'nombre',
        v_categoria,
        coalesce(f ->> 'color', ''),
        coalesce(f ->> 'talla', ''),
        coalesce(f ->> 'upc', ''),
        greatest(coalesce((f ->> 'stock')::int, 0), 0),
        1
      );
      insertados := insertados + 1;
    else
      update productos set
        nombre = f ->> 'nombre',
        categoria = v_categoria,
        color = coalesce(f ->> 'color', ''),
        talla = coalesce(f ->> 'talla', ''),
        upc = coalesce(f ->> 'upc', ''),
        stock = greatest(coalesce((f ->> 'stock')::int, 0), 0)
      where id = v_id;
      actualizados := actualizados + 1;
    end if;
  end loop;

  return next;
end;
$$;

revoke execute on function public.importar_productos(jsonb) from public, anon;
grant execute on function public.importar_productos(jsonb) to authenticated;
