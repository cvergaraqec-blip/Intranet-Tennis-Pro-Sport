import { Logo } from "@/components/iconos";
import { iniciarSesion } from "./actions";

const campo = "h-12 rounded-lg border border-borde bg-white px-3.5 text-base";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-wrap">
      <div className="flex min-h-72 flex-[1_1_420px] flex-col justify-between gap-12 bg-navy px-8 py-12 text-white md:px-14 md:py-16">
        <Logo className="text-4xl" />
        <div className="flex max-w-md flex-col gap-4">
          <h1 className="text-4xl leading-tight font-bold md:text-5xl">Intranet de l’équipe</h1>
          <p className="text-lg text-[#c9d3e3]">L’inventaire du magasin et les horaires du personnel, au même endroit.</p>
        </div>
        <p className="text-sm text-[#aab6ca]">Réservé au personnel autorisé</p>
      </div>
      <div className="flex flex-[1_1_420px] items-center justify-center px-6 py-12">
        <form action={iniciarSesion} className="flex w-full max-w-sm flex-col gap-5">
          <div>
            <h2 className="text-3xl font-bold">Connexion</h2>
            <p className="mt-1.5 text-tenue">Utilisez le nom d’utilisateur fourni par l’administrateur.</p>
          </div>
          {error && <p className="rounded-lg bg-[#fde7e7] px-3 py-2 text-sm text-[#a32020]">Utilisateur ou mot de passe incorrect.</p>}
          <label className="flex flex-col gap-2 text-[15px] font-semibold">
            Utilisateur
            <input name="usuario" required autoComplete="username" autoCapitalize="none" className={campo} />
          </label>
          <label className="flex flex-col gap-2 text-[15px] font-semibold">
            Mot de passe
            <input name="password" type="password" required autoComplete="current-password" className={campo} />
          </label>
          <button className="h-12 rounded-lg bg-navy text-[17px] font-semibold text-white">Se connecter</button>
        </form>
      </div>
    </main>
  );
}
