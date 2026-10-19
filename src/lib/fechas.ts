// Fechas como texto "AAAA-MM-DD", calculadas en la hora de Chile.
const ZONA = "America/Santiago";

export const DIAS = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"];
const DIAS_TITULO = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const MESES = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function hoy(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date());
}

export function horaActual(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ZONA,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}

function aDate(fecha: string) {
  return new Date(`${fecha}T00:00:00Z`);
}

export function sumarDias(fecha: string, dias: number): string {
  const d = aDate(fecha);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function lunesDe(fecha: string): string {
  const dia = (aDate(fecha).getUTCDay() + 6) % 7;
  return sumarDias(fecha, -dia);
}

export function esFecha(texto: string | undefined): texto is string {
  return !!texto && /^\d{4}-\d{2}-\d{2}$/.test(texto) && !Number.isNaN(aDate(texto).getTime());
}

export function numeroDia(fecha: string) {
  return aDate(fecha).getUTCDate();
}

export function nombreDia(fecha: string) {
  return DIAS_TITULO[(aDate(fecha).getUTCDay() + 6) % 7];
}

export function rangoSemana(lunes: string) {
  const a = aDate(lunes);
  const b = aDate(sumarDias(lunes, 6));
  const mesA = MESES[a.getUTCMonth()];
  const mesB = MESES[b.getUTCMonth()];
  return mesA === mesB
    ? `${a.getUTCDate()} – ${b.getUTCDate()} ${mesB}`
    : `${a.getUTCDate()} ${mesA} – ${b.getUTCDate()} ${mesB}`;
}

export function hora(t: string) {
  return t.slice(0, 5);
}
