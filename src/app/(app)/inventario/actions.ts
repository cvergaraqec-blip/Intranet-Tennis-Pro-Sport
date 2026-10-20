"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/perfil";
import { CATEGORIAS, categoriaDesde } from "@/lib/inventario";
import { leerCsv, normalizar } from "@/lib/csv";
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

  const supabase = await createClient();
  const { error } = await supabase.from("productos").insert({
    codigo: texto("sku"),
    nombre: texto("nombre"),
    categoria: categoriaDesde(texto("categoria")) ?? CATEGORIAS[3],
    color: texto("color"),
    talla: texto("talla"),
    upc: texto("upc"),
    stock: Math.max(0, Number(texto("stock")) || 0),
    minimo: Math.max(0, Number(texto("minimo")) || 0),
  });
  if (error?.code === "23505") redirect("/inventario?error=sku");
  revalidatePath("/inventario");
}

export async function eliminarProducto(formData: FormData) {
  await exigirAdmin();
  const supabase = await createClient();
  await supabase.from("productos").delete().eq("id", Number(formData.get("id")));
  revalidatePath("/inventario");
}

// Encabezados aceptados en el archivo, en francés, español o inglés.
const COLUMNAS: Record<string, string[]> = {
  nombre: ["produit", "producto", "nom", "nombre", "product", "name"],
  stock: ["stock", "quantite", "cantidad", "qty"],
  color: ["couleur", "color", "colour"],
  talla: ["taille", "talla", "size"],
  upc: ["upc", "code-barres", "code barres", "codigo de barras", "ean"],
  sku: ["sku", "code", "codigo", "reference", "ref"],
  categoria: ["categorie", "categoria", "category"],
};

export async function importarProductos(formData: FormData) {
  await exigirAdmin();
  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) redirect("/inventario?import=vacio");

  const filas = leerCsv(await archivo.text());
  const encabezados = (filas[0] ?? []).map(normalizar);
  const indice = Object.fromEntries(
    Object.entries(COLUMNAS).map(([clave, nombres]) => [clave, encabezados.findIndex((h) => nombres.includes(h))]),
  );
  if (indice.nombre < 0) redirect("/inventario?import=formato");

  const valor = (fila: string[], clave: string) => (indice[clave] >= 0 ? (fila[indice[clave]] ?? "").trim() : "");
  const productos = filas
    .slice(1)
    .map((fila) => ({
      nombre: valor(fila, "nombre"),
      stock: Math.max(0, Math.round(Number(valor(fila, "stock").replace(",", "."))) || 0),
      color: valor(fila, "color"),
      talla: valor(fila, "talla"),
      upc: valor(fila, "upc"),
      sku: valor(fila, "sku"),
      categoria: categoriaDesde(valor(fila, "categoria")) ?? "",
    }))
    .filter((p) => p.nombre);
  if (productos.length === 0) redirect("/inventario?import=vacio");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("importar_productos", { filas: productos }).single<{
    insertados: number;
    actualizados: number;
  }>();
  if (error || !data) redirect("/inventario?import=error");

  revalidatePath("/inventario");
  redirect(`/inventario?import=ok&nuevos=${data.insertados}&actualizados=${data.actualizados}`);
}
