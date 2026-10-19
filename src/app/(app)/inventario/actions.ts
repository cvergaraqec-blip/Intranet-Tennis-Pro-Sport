"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/perfil";
import { CATEGORIAS } from "@/lib/inventario";
import { createClient } from "@/lib/supabase/server";

export async function ajustarStock(formData: FormData) {
  const id = Number(formData.get("id"));
  const delta = formData.get("delta") === "-1" ? -1 : 1;

  const supabase = await createClient();
  await supabase.rpc("ajustar_stock", { p_id: id, p_delta: delta });
  revalidatePath("/inventario");
}

export async function agregarProducto(formData: FormData) {
  await exigirAdmin();
  const texto = (campo: string) => String(formData.get(campo) ?? "").trim();
  const categoria = texto("categoria");

  const supabase = await createClient();
  await supabase.from("productos").insert({
    codigo: texto("codigo"),
    nombre: texto("nombre"),
    categoria: (CATEGORIAS as readonly string[]).includes(categoria) ? categoria : CATEGORIAS[3],
    variante: texto("variante"),
    stock: Math.max(0, Number(texto("stock")) || 0),
    minimo: Math.max(0, Number(texto("minimo")) || 0),
  });
  revalidatePath("/inventario");
}

export async function eliminarProducto(formData: FormData) {
  await exigirAdmin();
  const supabase = await createClient();
  await supabase.from("productos").delete().eq("id", Number(formData.get("id")));
  revalidatePath("/inventario");
}
