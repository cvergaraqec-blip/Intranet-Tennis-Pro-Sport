"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/perfil";
import { createClient } from "@/lib/supabase/server";

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
