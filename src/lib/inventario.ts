export const CATEGORIAS = ["Raquetas", "Cordajes", "Grips", "Accesorios y Pelotas"] as const;

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
