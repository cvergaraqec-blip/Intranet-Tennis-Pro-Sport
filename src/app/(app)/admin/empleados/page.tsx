import { exigirAdmin, type Perfil } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";
import { cambiarRol } from "./actions";

export default async function EmpleadosPage() {
  const admin = await exigirAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("perfiles").select("id, nombre, rol").order("nombre");
  const perfiles = (data ?? []) as Perfil[];

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Empleados</h1>
      <p className="text-sm text-gray-500">
        Para agregar a alguien, invítalo desde Supabase (Authentication &gt; Users &gt; Invite user).
      </p>
      <ul className="bg-white rounded-xl shadow divide-y">
        {perfiles.map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex-1">{p.nombre}</span>
            {p.id === admin.id ? (
              <span className="text-sm text-gray-500">Administrador (tú)</span>
            ) : (
              <form action={cambiarRol} className="flex gap-2">
                <input type="hidden" name="id" value={p.id} />
                <select name="rol" defaultValue={p.rol} className="border rounded-md px-2 py-1 text-sm">
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
                <button className="text-sm text-green-700 hover:underline">Guardar</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
