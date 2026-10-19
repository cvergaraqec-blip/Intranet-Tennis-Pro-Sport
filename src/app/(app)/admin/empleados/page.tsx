import Link from "next/link";
import { exigirAdmin, type Perfil } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";
import { agregarEmpleado, cambiarRol, eliminarEmpleado } from "./actions";

type Empleado = {
  id: number;
  numero: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string | null;
};

const ERRORES: Record<string, string> = {
  numero: "Le numéro d’employé doit avoir 4 chiffres.",
  repetido: "Ce numéro d’employé existe déjà.",
  email: "Cet e-mail est déjà utilisé par un autre employé.",
  datos: "Vérifiez le prénom et le nom.",
};

const campo = "h-11 rounded-lg border border-borde bg-white px-3 text-[15px]";

export default async function EmpleadosPage({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string; error?: string }>;
}) {
  const { nuevo, error } = await searchParams;
  const admin = await exigirAdmin();
  const supabase = await createClient();
  const [{ data: fichas }, { data: cuentas }] = await Promise.all([
    supabase.from("empleados").select("id, numero, nombre, apellido, telefono, email").order("numero"),
    supabase.from("perfiles").select("id, nombre, rol").order("nombre"),
  ]);
  const empleados = (fichas ?? []) as Empleado[];
  const perfiles = (cuentas ?? []) as Perfil[];
  const siguiente = String(Math.max(0, ...empleados.map((e) => Number(e.numero))) + 1).padStart(4, "0");

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employés</h1>
          <p className="mt-1 text-[15px] text-tenue">Fiches du personnel du magasin</p>
        </div>
        <Link href="/admin/empleados?nuevo=1" className="flex h-12 items-center rounded-lg bg-acento px-5 font-semibold">
          + Ajouter un employé
        </Link>
      </div>

      {nuevo && (
        <form action={agregarEmpleado} className="grid gap-3 rounded-xl border border-borde bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Prénom
            <input name="nombre" required className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Nom
            <input name="apellido" required className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            N° d’employé (4 chiffres)
            <input
              name="numero"
              required
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              defaultValue={siguiente}
              className={`${campo} font-mono`}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Téléphone
            <input name="telefono" type="tel" className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            E-mail
            <input name="email" type="email" className={campo} />
          </label>
          <div className="flex items-end gap-2">
            <button className="h-11 rounded-lg bg-navy px-5 font-semibold text-white">Enregistrer</button>
            <Link href="/admin/empleados" className="flex h-11 items-center px-2 text-sm text-tenue">
              Annuler
            </Link>
          </div>
          {error && ERRORES[error] && <p className="text-sm text-[#a32020] sm:col-span-2 lg:col-span-3">{ERRORES[error]}</p>}
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-borde bg-white">
        <table className="w-full min-w-[720px] border-collapse text-[15px]">
          <thead>
            <tr className="text-left text-xs tracking-wide text-tenue">
              <th className="px-5 py-4 font-semibold">N°</th>
              <th className="px-3 py-4 font-semibold">PRÉNOM ET NOM</th>
              <th className="px-3 py-4 font-semibold">TÉLÉPHONE</th>
              <th className="px-3 py-4 font-semibold">E-MAIL</th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {empleados.map((e) => (
              <tr key={e.id} className="border-t border-suave">
                <td className="px-5 py-3.5 font-mono text-[13px] text-tenue">{e.numero}</td>
                <td className="px-3 py-3.5 font-semibold">
                  {e.nombre} {e.apellido}
                </td>
                <td className="px-3 py-3.5">{e.telefono}</td>
                <td className="px-3 py-3.5 text-tenue">{e.email}</td>
                <td className="px-5 py-2.5 text-right">
                  <form action={eliminarEmpleado}>
                    <input type="hidden" name="id" value={e.id} />
                    <button aria-label={`Supprimer ${e.nombre} ${e.apellido}`} className="h-10 rounded-lg px-2 text-sm text-tenue hover:text-[#a32020]">
                      Supprimer
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {empleados.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-tenue">
                  Aucun employé pour l’instant. Ajoutez le premier.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold">Comptes de connexion</h2>
        <p className="text-[15px] text-tenue">
          Pour qu’un employé puisse se connecter, invitez-le depuis Supabase (Authentication &gt; Users &gt; Invite user) avec le même e-mail que sa fiche.
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
    </section>
  );
}
