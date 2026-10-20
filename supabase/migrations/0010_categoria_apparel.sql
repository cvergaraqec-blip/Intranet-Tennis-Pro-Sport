alter table public.productos drop constraint productos_categoria_check,
  add constraint productos_categoria_check check (categoria in ('Shoes','Apparel','Raquetas','Cordajes','Grips','Accesorios y Pelotas'));
