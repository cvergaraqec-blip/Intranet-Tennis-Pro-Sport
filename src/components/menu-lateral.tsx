"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconoEmpleados, IconoHorarios, IconoInventario } from "./iconos";

const enlaces = [
  { href: "/inventario", texto: "Inventaire", Icono: IconoInventario, soloAdmin: false },
  { href: "/horarios", texto: "Horaires", Icono: IconoHorarios, soloAdmin: false },
  { href: "/admin/empleados", texto: "Employés", Icono: IconoEmpleados, soloAdmin: true },
];

export function MenuLateral({ esAdmin }: { esAdmin: boolean }) {
  const ruta = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {enlaces
        .filter((e) => esAdmin || !e.soloAdmin)
        .map(({ href, texto, Icono }) => {
          const activo = ruta.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-3 text-[15px] ${
                activo ? "bg-navy font-semibold text-white" : "hover:bg-suave"
              }`}
            >
              <Icono className="h-5 w-5" />
              {texto}
            </Link>
          );
        })}
    </nav>
  );
}
