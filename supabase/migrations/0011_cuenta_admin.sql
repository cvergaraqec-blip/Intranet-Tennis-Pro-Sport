-- La cuenta interna admin@prosport.local (identifiant "Admin") queda como administrador al crearse.
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
    case
      when new.email = 'admin@prosport.local' then 'admin'
      when exists (select 1 from public.perfiles) then 'empleado'
      else 'admin'
    end
  );
  return new;
end;
$$;
