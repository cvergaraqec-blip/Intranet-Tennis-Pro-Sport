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
      <h1 className="text-3xl font-bold">Employés</h1>
      <p className="text-[15px] text-tenue">
        Pour ajouter quelqu’un, invitez-le depuis Supabase (Authentication &gt; Users &gt; Invite user).
      </p>
      <ul className="divide-y divide-suave rounded-2xl border border-borde bg-white">
        {perfiles.map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-4 py-3">
            <span className="flex-1">{p.nombre}</span>
            {p.id === admin.id ? (
              <span className="text-sm text-tenue">Administrateur (vous)</span>
            ) : (
              <form action={cambiarRol} className="flex gap-2">
                <input type="hidden" name="id" value={p.id} />
                <select name="rol" defaultValue={p.rol} className="h-10 rounded-lg border border-borde px-2 text-sm">
                  <option value="empleado">Employé</option>
                  <option value="admin">Administrateur</option>
                </select>
                <button className="h-10 rounded-lg bg-navy px-3 text-sm font-semibold text-white">Enregistrer</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
