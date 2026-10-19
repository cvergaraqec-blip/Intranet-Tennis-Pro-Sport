"use client";

import { useEffect, useState } from "react";

const hora = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "America/Santiago",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});
const fecha = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "America/Santiago",
  weekday: "long",
  day: "numeric",
  month: "long",
});

// Hora en vivo; se pinta solo en el navegador para no desfasar con el servidor.
export function Reloj() {
  const [ahora, setAhora] = useState<Date | null>(null);

  useEffect(() => {
    setAhora(new Date());
    const id = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-6xl font-bold tabular-nums md:text-7xl">{ahora ? hora.format(ahora) : "--:--:--"}</span>
      <span className="text-lg text-tenue capitalize">{ahora ? fecha.format(ahora) : " "}</span>
    </div>
  );
}
