import Link from "next/link";
import { obtenerPerfil } from "@/lib/perfil";
import { cerrarSesion } from "@/app/login/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const perfil = await obtenerPerfil();

  return (
    <div className="min-h-screen">
      <header className="bg-green-800 text-white">
        <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
          <Link href="/" className="font-semibold">
            Tennis Pro Sport
          </Link>
          {perfil.rol === "admin" && (
            <Link href="/admin/empleados" className="text-sm hover:underline">
              Empleados
            </Link>
          )}
          <span className="ml-auto text-sm opacity-80">{perfil.nombre}</span>
          <form action={cerrarSesion}>
            <button className="text-sm hover:underline">Salir</button>
          </form>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto p-4">{children}</main>
    </div>
  );
}
