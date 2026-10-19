import Link from "next/link";
import { obtenerPerfil } from "@/lib/perfil";
import { IconoHorarios, IconoInventario } from "@/components/iconos";

const accesos = [
  { href: "/inventario", texto: "Inventario", Icono: IconoInventario },
  { href: "/horarios", texto: "Horarios", Icono: IconoHorarios },
];

export default async function Inicio() {
  const perfil = await obtenerPerfil();
  const nombre = perfil.nombre.split(/\s+/)[0];

  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-10 py-8 md:py-14">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Hola, {nombre}</h1>
        <p className="mt-2 text-lg text-tenue">¿Qué quieres revisar?</p>
      </div>
      <div className="grid w-full gap-6 sm:grid-cols-2">
        {accesos.map(({ href, texto, Icono }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-6 rounded-3xl border border-borde bg-white px-8 py-12 transition hover:border-navy"
          >
            <span className="flex h-32 w-32 items-center justify-center rounded-full bg-suave">
              <Icono className="h-16 w-16" />
            </span>
            <span className="text-3xl font-bold">{texto}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
