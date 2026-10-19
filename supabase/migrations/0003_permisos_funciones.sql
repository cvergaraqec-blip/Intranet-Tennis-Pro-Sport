-- crear_perfil solo se usa desde el trigger; es_admin solo la necesitan usuarios con sesión.
revoke execute on function public.crear_perfil() from public, anon, authenticated;
revoke execute on function public.es_admin() from public, anon;
grant execute on function public.es_admin() to authenticated;
