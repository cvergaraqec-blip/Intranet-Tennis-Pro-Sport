import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Rol = "admin" | "empleado";

export type Perfil = {
  id: string;
  nombre: string;
  rol: Rol;
};

export async function obtenerPerfil(): Promise<Perfil> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("perfiles")
    .select("id, nombre, rol")
    .eq("id", user.id)
    .single();

  return data ?? { id: user.id, nombre: user.email ?? "", rol: "empleado" };
}

export async function exigirAdmin(): Promise<Perfil> {
  const perfil = await obtenerPerfil();
  if (perfil.rol !== "admin") redirect("/");
  return perfil;
}
