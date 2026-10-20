export const CATEGORIAS = ["Shoes", "Raquetas", "Cordajes", "Grips", "Accesorios y Pelotas"] as const;

// Nombre que se muestra en pantalla; en la base se guarda el valor original.
export const NOMBRE_CATEGORIA: Record<string, string> = {
  Shoes: "Shoes",
  Raquetas: "Raquettes",
  Cordajes: "Cordages",
  Grips: "Grips",
  "Accesorios y Pelotas": "Accessoires et balles",
};

export type Categoria = (typeof CATEGORIAS)[number];

export type Producto = {
  id: number;
  codigo: string;
  nombre: string;
  categoria: Categoria;
  variante: string;
  color: string;
  talla: string;
  upc: string;
  sku: string;
  stock: number;
  minimo: number;
};

// Otras formas de escribir cada categoría (sin tildes, en minúsculas).
const SINONIMOS: Record<string, Categoria> = {
  shoe: "Shoes",
  chaussure: "Shoes",
  chaussures: "Shoes",
  zapatilla: "Shoes",
  zapatillas: "Shoes",
  zapatos: "Shoes",
  raquette: "Raquetas",
  raqueta: "Raquetas",
  cordage: "Cordajes",
  cordaje: "Cordajes",
  grip: "Grips",
  accessoires: "Accesorios y Pelotas",
  accessoire: "Accesorios y Pelotas",
  accesorios: "Accesorios y Pelotas",
  balles: "Accesorios y Pelotas",
  pelotas: "Accesorios y Pelotas",
  "accessoires et balles": "Accesorios y Pelotas",
  "accesorios y pelotas": "Accesorios y Pelotas",
};

// Acepta el nombre de la categoría en español o en francés, con o sin tildes.
export function categoriaDesde(texto: string): Categoria | null {
  const t = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  for (const c of CATEGORIAS) {
    if (c.toLowerCase() === t || NOMBRE_CATEGORIA[c].toLowerCase() === t) return c;
  }
  return SINONIMOS[t] ?? null;
}
