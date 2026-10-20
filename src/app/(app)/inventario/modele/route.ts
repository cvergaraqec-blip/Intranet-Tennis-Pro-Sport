// Plantilla CSV para la carga masiva; Excel la abre directamente.
const PLANTILLA = [
  "Produit;Stock;Couleur;Taille;UPC;SKU;Catégorie",
  "Wilson Pro Staff 97 v14;8;Noir;Grip 3;097512548123;WR125711U3;Raquettes",
  "Babolat Pure Aero 2023;2;Jaune;Grip 2;3324921893812;101479-2;Raquettes",
].join("\r\n");

export function GET() {
  return new Response(`﻿${PLANTILLA}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="modele-inventaire.csv"',
    },
  });
}
