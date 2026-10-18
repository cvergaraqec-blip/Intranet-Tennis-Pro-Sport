import { obtenerPerfil } from "@/lib/perfil";

export default async function Inicio() {
  const perfil = await obtenerPerfil();

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Hola, {perfil.nombre}</h1>
      <p className="text-gray-600">
        Entraste como {perfil.rol === "admin" ? "administrador" : "empleado"}.
      </p>
      <p className="text-gray-500 text-sm">Inventario y horarios estarán disponibles pronto.</p>
    </section>
  );
}
