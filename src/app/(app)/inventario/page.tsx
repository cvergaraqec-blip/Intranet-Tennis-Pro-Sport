import Link from "next/link";
import { obtenerPerfil } from "@/lib/perfil";
import { CATEGORIAS, NOMBRE_CATEGORIA, type Producto } from "@/lib/inventario";
import { createClient } from "@/lib/supabase/server";
import { IconoBuscar } from "@/components/iconos";
import { agregarProducto, ajustarStock, eliminarProducto, importarProductos } from "./actions";

const POR_PAGINA = [10, 25, 50, 100];

const campo = "h-11 rounded-lg border border-borde bg-white px-3 text-[15px]";

const MENSAJES_IMPORT: Record<string, string> = {
  vacio: "Le fichier est vide ou ne contient aucun produit.",
  formato: "Colonne « Produit » introuvable. Utilisez le modèle.",
  error: "L’importation a échoué. Vérifiez le fichier et réessayez.",
};

export default async function InventarioPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; p?: string; por?: string; import?: string; nuevos?: string; actualizados?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { q = "", cat = "" } = params;
  const porPagina = POR_PAGINA.includes(Number(params.por)) ? Number(params.por) : 25;
  const pagina = Math.max(1, Math.floor(Number(params.p)) || 1);
  const perfil = await obtenerPerfil();
  const esAdmin = perfil.rol === "admin";

  const supabase = await createClient();
  let consulta = supabase
    .from("productos")
    .select("id, codigo, nombre, categoria, variante, color, talla, upc, sku, stock, minimo", { count: "exact" })
    .order("nombre")
    .order("id")
    .range((pagina - 1) * porPagina, pagina * porPagina - 1);
  if (cat) consulta = consulta.eq("categoria", cat);
  if (q) {
    const limpio = q.replace(/[%,()]/g, " ");
    consulta = consulta.or(`nombre.ilike.%${limpio}%,sku.ilike.%${limpio}%,upc.ilike.%${limpio}%`);
  }
  const { data, count } = await consulta;
  const productos = (data ?? []) as Producto[];
  const total = count ?? 0;
  const paginas = Math.max(1, Math.ceil(total / porPagina));

  const url = (cambios: { cat?: string; p?: number; por?: number }) => {
    const c = cambios.cat ?? cat;
    const n = cambios.por ?? porPagina;
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (c) p.set("cat", c);
    if (n !== 25) p.set("por", String(n));
    if (cambios.p && cambios.p > 1) p.set("p", String(cambios.p));
    const s = p.toString();
    return s ? `/inventario?${s}` : "/inventario";
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventaire du magasin</h1>
          <p className="mt-1 text-[15px] text-tenue">Contrôle rapide des stocks au comptoir</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="/inventario/exporter" className="flex h-12 items-center rounded-lg border border-borde bg-white px-5 font-semibold">
            Exporter
          </a>
          {esAdmin && (
            <>
              <details className="relative">
                <summary className="flex h-12 cursor-pointer list-none items-center rounded-lg border border-borde bg-white px-5 font-semibold">
                  Importer
                </summary>
                <form
                  action={importarProductos}
                  className="absolute right-0 z-10 mt-2 flex w-[min(92vw,420px)] flex-col gap-3 rounded-xl border border-borde bg-white p-4 shadow-lg"
                >
                  <p className="text-sm text-tenue">
                    Chargez un fichier CSV (Excel : Fichier › Enregistrer sous › CSV) avec les colonnes Produit, Stock, Couleur, Taille, UPC,
                    SKU et Catégorie. Chaque ligne est une variante : si l’UPC existe déjà, le produit est mis à jour.
                  </p>
                  <a href="/inventario/modele" className="text-sm font-semibold text-navy underline">
                    Télécharger le modèle
                  </a>
                  <input name="archivo" type="file" accept=".csv,text/csv" required className="text-sm" />
                  <button className="h-11 rounded-lg bg-navy font-semibold text-white">Importer les produits</button>
                </form>
              </details>
              <details className="relative">
                <summary className="flex h-12 cursor-pointer list-none items-center rounded-lg bg-acento px-5 font-semibold">
                  + Ajouter un produit
                </summary>
                <form
                  action={agregarProducto}
                  className="absolute right-0 z-10 mt-2 grid w-[min(92vw,420px)] gap-3 rounded-xl border border-borde bg-white p-4 shadow-lg"
                >
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Produit
                    <input name="nombre" required className={campo} />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1 text-sm font-medium">
                      Couleur
                      <input name="color" className={campo} />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium">
                      Taille
                      <input name="talla" placeholder="Grip 3, M, 42…" className={campo} />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium">
                      UPC
                      <input name="upc" inputMode="numeric" className={campo} />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium">
                      SKU
                      <input name="sku" className={campo} />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Catégorie
                    <select name="categoria" className={campo}>
                      {CATEGORIAS.map((c) => (
                        <option key={c} value={c}>
                          {NOMBRE_CATEGORIA[c]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1 text-sm font-medium">
                      Stock
                      <input name="stock" type="number" min="0" defaultValue="0" className={campo} />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium">
                      Alerte stock bas
                      <input name="minimo" type="number" min="0" defaultValue="1" className={campo} />
                    </label>
                  </div>
                  <button className="h-11 rounded-lg bg-navy font-semibold text-white">Enregistrer</button>
                </form>
              </details>
            </>
          )}
        </div>
      </div>

      {params.import === "ok" && (
        <p className="rounded-lg bg-[#dff6ea] px-4 py-3 font-semibold text-[#136b3e]">
          Importation terminée : {params.nuevos ?? 0} produit(s) ajouté(s), {params.actualizados ?? 0} mis à jour.
        </p>
      )}
      {params.import && MENSAJES_IMPORT[params.import] && (
        <p className="rounded-lg bg-[#fde7e7] px-4 py-3 font-semibold text-[#a32020]">{MENSAJES_IMPORT[params.import]}</p>
      )}
      {params.error === "sku" && (
        <p className="rounded-lg bg-[#fde7e7] px-4 py-3 font-semibold text-[#a32020]">Cet UPC existe déjà.</p>
      )}

      <form action="/inventario" className="flex h-12 items-center gap-2.5 rounded-xl border border-borde bg-white px-4">
        <IconoBuscar className="h-[18px] w-[18px] text-tenue" />
        {cat && <input type="hidden" name="cat" value={cat} />}
        {porPagina !== 25 && <input type="hidden" name="por" value={porPagina} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          aria-label="Rechercher un produit"
          placeholder="Rechercher par produit, SKU ou UPC…"
          className="flex-1 bg-transparent text-base outline-none"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        {["", ...CATEGORIAS].map((c) => (
          <Link
            key={c || "todos"}
            href={url({ cat: c })}
            className={`flex h-9 items-center rounded-lg px-4 text-sm ${
              cat === c ? "bg-navy font-semibold text-white" : "border border-borde bg-white"
            }`}
          >
            {c ? NOMBRE_CATEGORIA[c] : "Tous"}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-borde bg-white">
        <table className="w-full min-w-[900px] border-collapse text-[13px]">
          <thead>
            <tr className="text-left text-xs tracking-wide text-tenue">
              <th className="px-5 py-4 font-semibold">PRODUIT</th>
              <th className="px-3 py-4 text-center font-semibold">STOCK</th>
              <th className="px-3 py-4 font-semibold">COULEUR</th>
              <th className="px-3 py-4 font-semibold">TAILLE</th>
              <th className="px-3 py-4 font-semibold">UPC</th>
              <th className="px-3 py-4 font-semibold">SKU</th>
              {esAdmin && <th className="px-5 py-4" />}
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => {
              const bajo = p.stock <= p.minimo;
              return (
                <tr key={p.id} className="border-t border-suave">
                  <td className="px-5 py-1.5 font-medium">{p.nombre}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <form action={ajustarStock}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="delta" value="-1" />
                        <button
                          aria-label={`Retirer un ${p.nombre}`}
                          disabled={p.stock === 0}
                          className="h-6 w-6 rounded-md bg-suave text-sm disabled:opacity-40"
                        >
                          −
                        </button>
                      </form>
                      <span
                        title={bajo ? "Stock bas" : undefined}
                        className={`min-w-8 text-center text-[13px] font-bold ${bajo ? "text-[#c02626]" : ""}`}
                      >
                        {p.stock}
                      </span>
                      <form action={ajustarStock}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="delta" value="1" />
                        <button aria-label={`Ajouter un ${p.nombre}`} className="h-6 w-6 rounded-md bg-navy text-sm text-white">
                          +
                        </button>
                      </form>
                    </div>
                  </td>
                  <td className="px-3 py-1.5">{p.color}</td>
                  <td className="px-3 py-1.5">{p.talla}</td>
                  <td className="px-3 py-1.5 font-mono text-tenue">{p.upc}</td>
                  <td className="px-3 py-1.5 font-mono text-tenue">{p.sku}</td>
                  {esAdmin && (
                    <td className="px-5 py-1 text-right">
                      <form action={eliminarProducto}>
                        <input type="hidden" name="id" value={p.id} />
                        <button aria-label={`Supprimer ${p.nombre}`} className="h-7 rounded-lg px-2 text-[13px] text-tenue hover:text-[#a32020]">
                          Supprimer
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              );
            })}
            {productos.length === 0 && (
              <tr>
                <td colSpan={esAdmin ? 7 : 6} className="px-5 py-10 text-center text-tenue">
                  {q || cat ? "Aucun produit ne correspond." : "Aucun produit pour l’instant. Ajoutez-en un ou importez un fichier."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-tenue">
            Afficher
            {POR_PAGINA.map((n) => (
              <Link
                key={n}
                href={url({ por: n })}
                className={`flex h-8 min-w-10 items-center justify-center rounded-lg px-2 ${
                  n === porPagina ? "bg-navy font-semibold text-white" : "border border-borde bg-white"
                }`}
              >
                {n}
              </Link>
            ))}
            par page
          </div>
          <div className="flex items-center gap-2">
            <span className="text-tenue">
              {(pagina - 1) * porPagina + 1}–{Math.min(pagina * porPagina, total)} sur {total}
            </span>
            {pagina > 1 ? (
              <Link href={url({ p: pagina - 1 })} className="flex h-8 items-center rounded-lg border border-borde bg-white px-3 font-semibold">
                ‹ Précédent
              </Link>
            ) : (
              <span className="flex h-8 items-center rounded-lg border border-borde px-3 text-tenue opacity-50">‹ Précédent</span>
            )}
            <span className="px-1 font-semibold">
              Page {pagina} / {paginas}
            </span>
            {pagina < paginas ? (
              <Link href={url({ p: pagina + 1 })} className="flex h-8 items-center rounded-lg border border-borde bg-white px-3 font-semibold">
                Suivant ›
              </Link>
            ) : (
              <span className="flex h-8 items-center rounded-lg border border-borde px-3 text-tenue opacity-50">Suivant ›</span>
            )}
          </div>
        </nav>
      )}
    </section>
  );
}
