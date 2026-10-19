"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/perfil";
import { esFecha, lunesDe } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";

export async function agregarTurno(formData: FormData) {
  await exigirAdmin();
  const fecha = String(formData.get("fecha") ?? "");
  const inicio = String(formData.get("inicio") ?? "");
  const fin = String(formData.get("fin") ?? "");
  const empleado = String(formData.get("empleado_id") ?? "");
  if (!esFecha(fecha) || !empleado || !inicio || !fin) return;

  const semana = lunesDe(fecha);
  if (fin <= inicio) redirect(`/horarios?semana=${semana}&nuevo=${fecha}&error=horas`);

  const supabase = await createClient();
  await supabase.from("turnos").insert({ empleado_id: empleado, fecha, inicio, fin });
  revalidatePath("/horarios");
  redirect(`/horarios?semana=${semana}`);
}

export async function eliminarTurno(formData: FormData) {
  await exigirAdmin();
  const supabase = await createClient();
  await supabase.from("turnos").delete().eq("id", Number(formData.get("id")));
  revalidatePath("/horarios");
}
