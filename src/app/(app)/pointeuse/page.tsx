import { createClient } from "@/lib/supabase/server";
import { hoy } from "@/lib/fechas";
import { Reloj } from "@/components/reloj";
import { IconoEntrada, IconoSalida } from "@/components/iconos";
import { marcar } from "./actions";

type Marca = {
  id: number;
  tipo: "entrada" | "salida";
  momento: string;
  empleados: { numero: string; nombre: string; apellido: string } | null;
};

const ZONA = "America/Santiago";
const diaChile = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA });
const horaChile = new Intl.DateTimeFormat("fr-FR", { timeZone: ZONA, hour: "2-digit", minute: "2-digit" });

export default async function PointeusePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; tipo?: string; error?: string }>;
}) {
  const { ok, tipo, error } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("marcajes")
    .select("id, tipo, momento, empleados(numero, nombre, apellido)")
    .order("momento", { ascending: false })
    .limit(200);
  const fechaHoy = hoy();
  const marcas = ((data ?? []) as unknown as Marca[]).filter((m) => diaChile.format(new Date(m.momento)) === fechaHoy);

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Pointeuse</h1>
        <p className="mt-1 text-[15px] text-tenue">Saisissez votre numéro d’employé et pointez votre arrivée ou votre départ.</p>
      </div>

      <form action={marcar} className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl border border-borde bg-white px-6 py-10">
        <Reloj />

        {ok && (
          <p className="w-full rounded-lg bg-[#dff6ea] px-4 py-3 text-center font-semibold text-[#136b3e]">
            {tipo === "salida" ? "Départ" : "Arrivée"} enregistrée : {ok}
          </p>
        )}
        {error && (
          <p className="w-full rounded-lg bg-[#fde7e7] px-4 py-3 text-center font-semibold text-[#a32020]">
            Numéro d’employé introuvable.
          </p>
        )}

        <label className="flex w-full max-w-xs flex-col items-center gap-2 text-[15px] font-semibold">
          N° d’employé
          <input
            name="numero"
            required
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            autoComplete="off"
            autoFocus
            placeholder="0000"
            className="h-16 w-full rounded-xl border border-borde text-center font-mono text-3xl tracking-[0.4em]"
          />
        </label>

        <div className="grid w-full grid-cols-2 gap-4">
          <button
            name="tipo"
            value="entrada"
            className="flex flex-col items-center gap-2 rounded-2xl bg-[#22a05b] px-4 py-6 text-xl font-bold text-white"
          >
            <IconoEntrada className="h-12 w-12" />
            Entrée
          </button>
          <button
            name="tipo"
            value="salida"
            className="flex flex-col items-center gap-2 rounded-2xl bg-navy px-4 py-6 text-xl font-bold text-white"
          >
            <IconoSalida className="h-12 w-12" />
            Sortie
          </button>
        </div>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold">Pointages d’aujourd’hui</h2>
        {marcas.length === 0 ? (
          <p className="rounded-xl border border-borde bg-white p-4 text-tenue">Aucun pointage aujourd’hui.</p>
        ) : (
          <ul className="divide-y divide-suave rounded-2xl border border-borde bg-white">
            {marcas.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-14 font-mono text-[13px] text-tenue">{m.empleados?.numero}</span>
                <span className="flex-1 font-semibold">
                  {m.empleados?.nombre} {m.empleados?.apellido}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-semibold ${
                    m.tipo === "entrada" ? "bg-[#dff6ea] text-[#136b3e]" : "bg-suave text-navy"
                  }`}
                >
                  {m.tipo === "entrada" ? <IconoEntrada className="h-4 w-4" /> : <IconoSalida className="h-4 w-4" />}
                  {m.tipo === "entrada" ? "Entrée" : "Sortie"}
                </span>
                <span className="w-14 text-right font-semibold tabular-nums">{horaChile.format(new Date(m.momento))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
