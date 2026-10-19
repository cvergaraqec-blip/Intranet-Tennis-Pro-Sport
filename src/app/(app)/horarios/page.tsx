import Link from "next/link";
import { obtenerPerfil } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";
import {
  DIAS, esFecha, hoy, hora, horaActual, lunesDe, nombreDia, numeroDia, rangoSemana, sumarDias,
} from "@/lib/fechas";
import { agregarTurno, eliminarTurno } from "./actions";

type Turno = {
  id: number;
  fecha: string;
  inicio: string;
  fin: string;
  empleado_id: number;
  nombre: string;
};

type Ficha = { nombre: string; apellido: string };

type FilaTurno = Omit<Turno, "nombre"> & {
  empleados: Ficha | Ficha[] | null;
};

function aTurno(f: FilaTurno): Turno {
  const { empleados, ...resto } = f;
  const ficha = Array.isArray(empleados) ? empleados[0] : empleados;
  return { ...resto, nombre: ficha ? `${ficha.nombre} ${ficha.apellido}` : "" };
}

function iniciales(nombre: string) {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function nombreCorto(nombre: string) {
  const [primero, segundo] = nombre.split(/\s+/).filter(Boolean);
  return segundo ? `${primero} ${segundo[0]}.` : (primero ?? "");
}

type Marca = { empleado_id: number; tipo: "entrada" | "salida"; momento: string };
type Pointage = { entrada?: string; salida?: string };

const ZONA = "America/Santiago";
const diaChile = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA });
const horaChile = new Intl.DateTimeFormat("en-GB", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

// Primera entrada y última salida de cada empleado por día.
function agruparMarcas(marcas: Marca[]) {
  const mapa = new Map<string, Pointage>();
  for (const m of marcas) {
    const fecha = new Date(m.momento);
    const clave = `${m.empleado_id}|${diaChile.format(fecha)}`;
    const hhmm = horaChile.format(fecha);
    const p = mapa.get(clave) ?? {};
    if (m.tipo === "entrada" && (!p.entrada || hhmm < p.entrada)) p.entrada = hhmm;
    if (m.tipo === "salida" && (!p.salida || hhmm > p.salida)) p.salida = hhmm;
    mapa.set(clave, p);
  }
  return mapa;
}

// Línea con lo marcado en la Pointeuse bajo cada turno del tablero.
function Pointe({ p, pasado }: { p: Pointage; pasado: boolean }) {
  if (!p.entrada && !p.salida) {
    return pasado ? <span className="text-[12px] font-semibold text-[#a32020]">Non pointé</span> : null;
  }
  return (
    <span className="text-[12px] font-semibold text-[#136b3e]">
      ✓ {p.salida ? `${p.entrada ?? "--:--"} – ${p.salida}` : `Arrivée ${p.entrada}`}
    </span>
  );
}

const campo = "h-11 rounded-lg border border-borde bg-white px-3 text-[15px]";

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string; nuevo?: string; error?: string }>;
}) {
  const params = await searchParams;
  const perfil = await obtenerPerfil();
  const esAdmin = perfil.rol === "admin";

  const fechaHoy = hoy();
  const ahora = horaActual();
  const lunes = lunesDe(esFecha(params.semana) ? params.semana : fechaHoy);
  const domingo = sumarDias(lunes, 6);
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  const nuevo = esFecha(params.nuevo) ? params.nuevo : null;

  const supabase = await createClient();
  const columnas = "id, fecha, inicio, fin, empleado_id, empleados(nombre, apellido)";
  const [{ data: deSemana }, { data: deHoy }, { data: empleados }, { data: deMarcas }] = await Promise.all([
    supabase.from("turnos").select(columnas).gte("fecha", lunes).lte("fecha", domingo).order("inicio"),
    supabase.from("turnos").select(columnas).eq("fecha", fechaHoy).order("inicio"),
    esAdmin
      ? supabase.from("empleados").select("id, numero, nombre, apellido").order("nombre")
      : Promise.resolve({ data: [] as { id: number; numero: string; nombre: string; apellido: string }[] }),
    // Margen de un día a cada lado por la diferencia horaria con UTC.
    supabase
      .from("marcajes")
      .select("empleado_id, tipo, momento")
      .gte("momento", `${sumarDias(lunes, -1)}T00:00:00Z`)
      .lt("momento", `${sumarDias(domingo, 2)}T00:00:00Z`),
  ]);
  const pointages = agruparMarcas((deMarcas ?? []) as Marca[]);
  const pointage = (t: Turno) => pointages.get(`${t.empleado_id}|${t.fecha}`) ?? {};
  const turnosSemana = ((deSemana ?? []) as FilaTurno[]).map(aTurno);
  const turnosHoy = ((deHoy ?? []) as FilaTurno[]).map(aTurno);

  const estado = (t: Turno) => {
    const p = pointage(t);
    if (p.salida && (!p.entrada || p.salida >= p.entrada))
      return { texto: `Pointé ${p.entrada ?? "--:--"} – ${p.salida}`, color: "text-tenue" };
    if (p.entrada) return { texto: `En magasin depuis ${p.entrada}`, color: "text-[#136b3e]" };
    if (t.fecha === fechaHoy && ahora >= hora(t.fin)) return { texto: "Pas de pointage", color: "text-[#a32020]" };
    if (t.fecha === fechaHoy && ahora >= hora(t.inicio)) return { texto: "En retard, pas encore pointé", color: "text-[#a32020]" };
    return { texto: `Arrive à ${hora(t.inicio)}`, color: "text-tenue" };
  };

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Horaires du magasin</h1>
          <p className="mt-1 text-[15px] text-tenue">
            {esAdmin ? "Planning hebdomadaire du personnel" : "Vos horaires de la semaine"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-borde bg-white p-0.5">
            <Link href={`/horarios?semana=${sumarDias(lunes, -7)}`} aria-label="Semaine précédente" className="flex h-11 w-11 items-center justify-center text-lg">
              ‹
            </Link>
            <span className="px-2 text-[15px] font-semibold">{rangoSemana(lunes)}</span>
            <Link href={`/horarios?semana=${sumarDias(lunes, 7)}`} aria-label="Semaine suivante" className="flex h-11 w-11 items-center justify-center text-lg">
              ›
            </Link>
          </div>
          {esAdmin && (
            <Link
              href={`/horarios?semana=${lunes}&nuevo=${dias.includes(fechaHoy) ? fechaHoy : lunes}`}
              className="flex h-12 items-center rounded-lg bg-acento px-5 font-semibold"
            >
              + Ajouter un horaire
            </Link>
          )}
        </div>
      </div>

      {esAdmin && nuevo && (empleados ?? []).length === 0 && (
        <p className="rounded-xl border border-borde bg-white p-4 text-tenue">
          Ajoutez d’abord un employé dans{" "}
          <Link href="/admin/empleados" className="font-semibold text-navy underline">
            Employés
          </Link>
          .
        </p>
      )}

      {esAdmin && nuevo && (empleados ?? []).length > 0 && (
        <form action={agregarTurno} className="flex flex-wrap items-end gap-3 rounded-xl border border-borde bg-white p-4">
          <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm font-medium">
            Employé
            <select name="empleado_id" required defaultValue="" className={campo}>
              <option value="" disabled>
                Choisir un employé
              </option>
              {(empleados ?? []).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre} {e.apellido} ({e.numero})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Jour
            <input name="fecha" type="date" required defaultValue={nuevo} className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Arrivée
            <input name="inicio" type="time" required defaultValue="09:00" className={campo} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Départ
            <input name="fin" type="time" required defaultValue="17:00" className={campo} />
          </label>
          <button className="h-11 rounded-lg bg-navy px-5 font-semibold text-white">Enregistrer</button>
          <Link href={`/horarios?semana=${lunes}`} className="flex h-11 items-center px-2 text-sm text-tenue">
            Annuler
          </Link>
          {params.error === "horas" && (
            <p className="w-full text-sm text-[#a32020]">L’heure de départ doit être après l’heure d’arrivée.</p>
          )}
        </form>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap justify-between gap-2">
          <h2 className="flex items-center gap-2 text-[17px] font-semibold">
            <span className="h-2 w-2 rounded-full bg-[#22a05b]" />
            Aujourd’hui en magasin · {nombreDia(fechaHoy)} {numeroDia(fechaHoy)}
          </h2>
          <span className="text-[13px] text-tenue">
            {turnosHoy.length === 1 ? "1 horaire prévu" : `${turnosHoy.length} horaires prévus`}
          </span>
        </div>
        {turnosHoy.length === 0 ? (
          <p className="rounded-xl border border-borde bg-white p-4 text-tenue">Aucun horaire aujourd’hui.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {turnosHoy.map((t) => {
              const e = estado(t);
              return (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-borde bg-white px-3.5 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-acento">
                    {iniciales(t.nombre)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-semibold">{t.nombre}</span>
                    <span className={`text-xs ${e.color}`}>{e.texto}</span>
                  </span>
                  <span className="whitespace-nowrap rounded-lg bg-suave px-2.5 py-1.5 text-sm font-semibold">
                    {hora(t.inicio)} – {hora(t.fin)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[17px] font-semibold">Planning de la semaine</h2>
        <div className="overflow-x-auto">
          <div className="grid min-w-[960px] grid-cols-7 gap-2.5">
            {dias.map((fecha, i) => {
              const esHoy = fecha === fechaHoy;
              const turnos = turnosSemana.filter((t) => t.fecha === fecha);
              return (
                <div
                  key={fecha}
                  className={`flex min-h-72 flex-col gap-2 rounded-xl bg-white p-3 ${
                    esHoy ? "border-2 border-navy" : "border border-borde"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="flex flex-col items-start gap-1 text-xs font-semibold tracking-wide text-tenue">
                      {DIAS[i]}
                      {esHoy && <span className="rounded bg-navy px-1.5 py-0.5 text-[10px] text-white">AUJ.</span>}
                    </span>
                    <span className="text-2xl leading-none font-bold">{numeroDia(fecha)}</span>
                  </div>
                  {turnos.map((t) => (
                    <div key={t.id} className="group relative flex flex-col gap-0.5 rounded-lg bg-suave px-2.5 py-2">
                      <span className={`truncate text-sm font-semibold ${esAdmin ? "pr-5" : ""}`}>{nombreCorto(t.nombre)}</span>
                      <span className="text-[13px] text-navy-claro">
                        {hora(t.inicio)} – {hora(t.fin)}
                      </span>
                      <Pointe p={pointage(t)} pasado={t.fecha < fechaHoy || (t.fecha === fechaHoy && ahora >= hora(t.fin))} />
                      {esAdmin && (
                        <form action={eliminarTurno} className="absolute top-1 right-1">
                          <input type="hidden" name="id" value={t.id} />
                          <button aria-label={`Supprimer l’horaire de ${t.nombre}`} className="h-6 w-6 rounded text-tenue hover:bg-white hover:text-[#a32020]">
                            ×
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                  {esAdmin && (
                    <Link
                      href={`/horarios?semana=${lunes}&nuevo=${fecha}`}
                      className={`mt-auto flex h-9 items-center justify-center rounded-lg text-[13px] ${
                        esHoy ? "bg-navy text-white" : "border border-borde"
                      }`}
                    >
                      + Horaire
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </section>
  );
}
