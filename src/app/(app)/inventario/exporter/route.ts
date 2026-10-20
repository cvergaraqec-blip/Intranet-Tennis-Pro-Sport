import { NOMBRE_CATEGORIA, type Producto } from "@/lib/inventario";
import { createClient } from "@/lib/supabase/server";

// Mismo formato que la plantilla de importación, para editar y volver a cargar.
const celda = (v: string) =>
  /[;"\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
// ="…" hace que Excel muestre el código tal cual, sin notación científica.
const codigo = (v: string) => (v ? `="${v.replace(/"/g, "")}"` : "");

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Non autorisé", { status: 401 });

  const { data } = await supabase
    .from("productos")
    .select("nombre, categoria, color, talla, upc, sku, stock")
    .order("nombre");
  const productos = (data ?? []) as Pick<
    Producto,
    "nombre" | "categoria" | "color" | "talla" | "upc" | "sku" | "stock"
  >[];

  const lineas = [
    "Produit;Stock;Couleur;Taille;UPC;SKU;Catégorie",
    ...productos.map((p) =>
      [
        celda(p.nombre),
        String(p.stock),
        celda(p.color),
        celda(p.talla),
        codigo(p.upc),
        codigo(p.sku),
        NOMBRE_CATEGORIA[p.categoria] ?? p.categoria,
      ].join(";"),
    ),
  ];
  const fecha = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
  }).format(new Date());

  return new Response(`﻿${lineas.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inventaire-${fecha}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
