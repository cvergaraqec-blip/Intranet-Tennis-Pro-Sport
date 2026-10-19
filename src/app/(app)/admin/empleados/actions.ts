"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";

export async function agregarEmpleado(formData: FormData) {
  await exigirAdmin();
  const texto = (campo: string) => String(formData.get(campo) ?? "").trim();
  const numero = texto("numero");
  const nombre = texto("nombre");
  const apellido = texto("apellido");
  const email = texto("email").toLowerCase();

  if (!/^[0-9]{4}$/.test(numero)) redirect("/admin/empleados?nuevo=1&error=numero");
  if (!nombre || !apellido) redirect("/admin/empleados?nuevo=1&error=datos");

  const supabase = await createClient();
  const { error } = await supabase.from("empleados").insert({
    numero,
    nombre,
    apellido,
    telefono: texto("telefono"),
    email: email || null,
  });

  if (error) {
    // 23505: número o correo repetido
    const motivo = error.code === "23505" ? (error.message.includes("email") ? "email" : "repetido") : "datos";
    redirect(`/admin/empleados?nuevo=1&error=${motivo}`);
  }
  revalidatePath("/admin/empleados");
  redirect("/admin/empleados");
}

export async function eliminarEmpleado(formData: FormData) {
  await exigirAdmin();
  const supabase = await createClient();
  await supabase.from("empleados").delete().eq("id", Number(formData.get("id")));
  revalidatePath("/admin/empleados");
}

export async function cambiarRol(formData: FormData) {
  const admin = await exigirAdmin();
  const id = String(formData.get("id"));
  const rol = formData.get("rol") === "admin" ? "admin" : "empleado";

  // Evita que el administrador se quite su propio acceso
  if (id === admin.id) return;

  const supabase = await createClient();
  await supabase.from("perfiles").update({ rol }).eq("id", id);
  revalidatePath("/admin/empleados");
}
