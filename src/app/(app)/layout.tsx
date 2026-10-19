import Link from "next/link";
import { obtenerPerfil } from "@/lib/perfil";
import { cerrarSesion } from "@/app/login/actions";
import { Logo } from "@/components/iconos";
import { MenuLateral } from "@/components/menu-lateral";

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const perfil = await obtenerPerfil();
  const esAdmin = perfil.rol === "admin";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col gap-5 border-b border-borde bg-white p-4 md:w-64 md:shrink-0 md:border-r md:border-b-0">
        <Link href="/" className="flex items-center gap-2.5 px-1.5">
          <Logo className="h-7 w-7" />
          <span className="text-lg font-semibold">Tennis ProSport</span>
        </Link>
        <MenuLateral esAdmin={esAdmin} />
        <div className="flex items-center gap-2.5 rounded-lg bg-suave px-3 py-2.5 md:mt-auto">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-[13px] font-semibold text-lima">
            {iniciales(perfil.nombre)}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold">{perfil.nombre}</span>
            <span className="text-xs text-tenue">{esAdmin ? "Administrador" : "Empleado"}</span>
          </span>
          <form action={cerrarSesion}>
            <button className="rounded-md px-2 py-1 text-xs text-tenue hover:bg-white">Salir</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-7">{children}</main>
    </div>
  );
}
