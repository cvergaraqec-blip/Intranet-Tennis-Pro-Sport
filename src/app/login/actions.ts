"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Un identifiant sin "@" (por ejemplo "Admin") corresponde a una cuenta interna nombre@prosport.local.
const DOMINIO_INTERNO = "prosport.local";

export async function iniciarSesion(formData: FormData) {
  const identifiant = String(formData.get("usuario") ?? "").trim();
  const email = identifiant.includes("@") ? identifiant : `${identifiant.toLowerCase()}@${DOMINIO_INTERNO}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: String(formData.get("password") ?? ""),
  });

  if (error) redirect("/login?error=1");
  redirect("/");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
