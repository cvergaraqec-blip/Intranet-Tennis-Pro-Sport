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
        <div className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <span className="text-xl font-semibold">Tennis ProSport</span>
        </div>
        <div className="flex max-w-md flex-col gap-4">
          <h1 className="text-4xl leading-tight font-bold md:text-5xl">Intranet del equipo</h1>
          <p className="text-lg text-[#c9d3e3]">Inventario de la tienda y turnos del personal, en un solo lugar.</p>
        </div>
        <p className="text-sm text-[#aab6ca]">Solo para personal autorizado</p>
      </div>
      <div className="flex flex-[1_1_420px] items-center justify-center px-6 py-12">
        <form action={iniciarSesion} className="flex w-full max-w-sm flex-col gap-5">
          <div>
            <h2 className="text-3xl font-bold">Entrar</h2>
            <p className="mt-1.5 text-tenue">Usa el correo que te dio el administrador.</p>
          </div>
          {error && <p className="rounded-lg bg-[#fde7e7] px-3 py-2 text-sm text-[#a32020]">Correo o contraseña incorrectos.</p>}
          <label className="flex flex-col gap-2 text-[15px] font-semibold">
            Correo
            <input name="email" type="email" required autoComplete="email" className={campo} />
          </label>
          <label className="flex flex-col gap-2 text-[15px] font-semibold">
            Contraseña
            <input name="password" type="password" required autoComplete="current-password" className={campo} />
          </label>
          <button className="h-12 rounded-lg bg-navy text-[17px] font-semibold text-white">Entrar</button>
        </form>
      </div>
    </main>
  );
}
