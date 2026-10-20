-- Al actualizar, una celda de categoría vacía conserva la categoría actual.
create or replace function public.importar_productos(filas jsonb)
returns table (insertados int, actualizados int)
language plpgsql
security definer
set search_path = public
as $$
declare
  f jsonb;
  v_sku text;
  v_upc text;
  v_color text;
  v_talla text;
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
    v_upc := trim(coalesce(f ->> 'upc', ''));
    v_color := trim(coalesce(f ->> 'color', ''));
    v_talla := trim(coalesce(f ->> 'talla', ''));
    v_categoria := coalesce(nullif(f ->> 'categoria', ''), 'Accesorios y Pelotas');
    v_id := null;

    if v_upc <> '' then
      select id into v_id from productos where upc = v_upc;
    elsif v_sku <> '' then
      select id into v_id from productos
      where sku = v_sku and upc = '' and color = v_color and talla = v_talla
      limit 1;
    end if;

    if v_id is null then
      insert into productos (sku, nombre, categoria, color, talla, upc, stock, minimo)
      values (v_sku, f ->> 'nombre', v_categoria, v_color, v_talla, v_upc,
              greatest(coalesce((f ->> 'stock')::int, 0), 0), 1);
      insertados := insertados + 1;
    else
      update productos set
        sku = v_sku,
        nombre = f ->> 'nombre',
        categoria = coalesce(nullif(f ->> 'categoria', ''), categoria),
        color = v_color,
        talla = v_talla,
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
