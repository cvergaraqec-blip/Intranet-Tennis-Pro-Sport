"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function marcar(formData: FormData) {
  const numero = String(formData.get("numero") ?? "").trim();
  const tipo = formData.get("tipo") === "salida" ? "salida" : "entrada";
  if (!/^[0-9]{4}$/.test(numero)) redirect("/pointeuse?error=1");

  const supabase = await createClient();
  const { data: nombre } = await supabase.rpc("marcar", { p_numero: numero, p_tipo: tipo });
  if (!nombre) redirect("/pointeuse?error=1");

  revalidatePath("/pointeuse");
  redirect(`/pointeuse?ok=${encodeURIComponent(nombre)}&tipo=${tipo}`);
}
