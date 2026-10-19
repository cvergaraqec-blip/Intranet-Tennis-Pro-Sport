import Link from "next/link";
import { obtenerPerfil } from "@/lib/perfil";
import { CATEGORIAS, type Producto } from "@/lib/inventario";
import { createClient } from "@/lib/supabase/server";
import { IconoBuscar } from "@/components/iconos";
import { agregarProducto, ajustarStock, eliminarProducto } from "./actions";

const campo = "h-11 rounded-lg border border-borde bg-white px-3 text-[15px]";

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q = "", cat = "" } = await searchParams;
  const perfil = await obtenerPerfil();
  const esAdmin = perfil.rol === "admin";

  const supabase = await createClient();
  let consulta = supabase
    .from("productos")
    .select("id, codigo, nombre, categoria, variante, stock, minimo")
    .order("nombre");
  if (cat) consulta = consulta.eq("categoria", cat);
  if (q) {
    const limpio = q.replace(/[%,()]/g, " ");
    consulta = consulta.or(`nombre.ilike.%${limpio}%,codigo.ilike.%${limpio}%`);
  }
  const { data } = await consulta;
  const productos = (data ?? []) as Producto[];

  const urlCategoria = (c: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (c) params.set("cat", c);
    const s = params.toString();
    return s ? `/inventario?${s}` : "/inventario";
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventario de Tienda</h1>
          <p className="mt-1 text-[15px] text-tenue">Control de existencias rápido en mostrador</p>
        </div>
        {esAdmin && (
          <details className="group relative">
            <summary className="flex h-12 cursor-pointer list-none items-center rounded-lg bg-acento px-5 font-semibold">
              + Agregar producto
            </summary>
            <form
              action={agregarProducto}
              className="absolute right-0 z-10 mt-2 grid w-[min(92vw,420px)] gap-3 rounded-xl border border-borde bg-white p-4 shadow-lg"
            >
              <label className="flex flex-col gap-1 text-sm font-medium">
                Nombre
                <input name="nombre" required className={campo} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Código
                  <input name="codigo" className={campo} />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Variante
                  <input name="variante" placeholder="Grip 3, Blanco…" className={campo} />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Categoría
                <select name="categoria" className={campo}>
                  {CATEGORIAS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  En stock
                  <input name="stock" type="number" min="0" defaultValue="0" className={campo} />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Avisar bajo
                  <input name="minimo" type="number" min="0" defaultValue="1" className={campo} />
                </label>
              </div>
              <button className="h-11 rounded-lg bg-navy font-semibold text-white">Guardar</button>
            </form>
          </details>
        )}
      </div>

      <form action="/inventario" className="flex h-12 items-center gap-2.5 rounded-xl border border-borde bg-white px-4">
        <IconoBuscar className="h-[18px] w-[18px] text-tenue" />
        {cat && <input type="hidden" name="cat" value={cat} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          aria-label="Buscar producto"
          placeholder="Buscar por producto o código…"
          className="flex-1 bg-transparent text-base outline-none"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        {["", ...CATEGORIAS].map((c) => (
          <Link
            key={c || "todos"}
            href={urlCategoria(c)}
            className={`flex h-9 items-center rounded-lg px-4 text-sm ${
              cat === c ? "bg-navy font-semibold text-white" : "border border-borde bg-white"
            }`}
          >
            {c || "Todos"}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-borde bg-white">
        <table className="w-full min-w-[820px] border-collapse text-[15px]">
          <thead>
            <tr className="text-left text-xs tracking-wide text-tenue">
              <th className="px-5 py-4 font-semibold">CÓDIGO</th>
              <th className="px-3 py-4 font-semibold">PRODUCTO</th>
              <th className="px-3 py-4 font-semibold">VARIANTE</th>
              <th className="px-3 py-4 font-semibold">ESTADO</th>
              <th className="px-3 py-4 text-center font-semibold">EN STOCK</th>
              <th className="px-5 py-4 text-center font-semibold">AJUSTE RÁPIDO</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => {
              const bajo = p.stock <= p.minimo;
              return (
                <tr key={p.id} className="border-t border-suave">
                  <td className="px-5 py-3.5 font-mono text-[13px] text-tenue">{p.codigo}</td>
                  <td className="px-3 py-3.5 font-semibold">{p.nombre}</td>
                  <td className="px-3 py-3.5 text-tenue">{p.variante}</td>
                  <td className="px-3 py-3.5">
                    {bajo ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#fde7e7] px-2.5 py-1 text-[13px] font-semibold text-[#a32020]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#d23b3b]" />
                        Bajo / Agotado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#dff6ea] px-2.5 py-1 text-[13px] font-semibold text-[#136b3e]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#22a05b]" />
                        Stock normal
                      </span>
                    )}
                  </td>
                  <td className={`px-3 py-3.5 text-center text-xl font-bold ${bajo ? "text-[#c02626]" : ""}`}>
                    {p.stock}
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center justify-center gap-2">
                      <form action={ajustarStock}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="delta" value="-1" />
                        <button
                          aria-label={`Restar uno a ${p.nombre}`}
                          disabled={p.stock === 0}
                          className="h-11 w-11 rounded-lg bg-suave text-xl disabled:opacity-40"
                        >
                          −
                        </button>
                      </form>
                      <form action={ajustarStock}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="delta" value="1" />
                        <button aria-label={`Sumar uno a ${p.nombre}`} className="h-11 w-11 rounded-lg bg-navy text-xl text-white">
                          +
                        </button>
                      </form>
                      {esAdmin && (
                        <form action={eliminarProducto}>
                          <input type="hidden" name="id" value={p.id} />
                          <button aria-label={`Eliminar ${p.nombre}`} className="ml-1 h-11 rounded-lg px-2 text-sm text-tenue hover:text-[#a32020]">
                            Quitar
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {productos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-tenue">
                  {q || cat ? "No hay productos que coincidan." : "Todavía no hay productos. Agrega el primero."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
