export const CATEGORIAS = ["Raquetas", "Cordajes", "Grips", "Accesorios y Pelotas"] as const;

// Nombre que se muestra en pantalla; en la base se guarda el valor original.
export const NOMBRE_CATEGORIA: Record<string, string> = {
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
  stock: number;
  minimo: number;
};
