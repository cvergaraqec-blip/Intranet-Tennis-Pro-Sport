import { iniciarSesion } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form
        action={iniciarSesion}
        className="w-full max-w-sm bg-white rounded-xl shadow p-6 flex flex-col gap-4"
      >
        <h1 className="text-xl font-semibold text-center">Tennis Pro Sport</h1>
        <p className="text-sm text-gray-500 text-center -mt-2">Intranet</p>
        {error && (
          <p className="text-sm text-red-600 text-center">Correo o contraseña incorrectos.</p>
        )}
        <label className="flex flex-col gap-1 text-sm">
          Correo
          <input name="email" type="email" required className="border rounded-md px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Contraseña
          <input name="password" type="password" required className="border rounded-md px-3 py-2" />
        </label>
        <button className="bg-green-700 hover:bg-green-800 text-white rounded-md py-2 font-medium">
          Entrar
        </button>
      </form>
    </main>
  );
}
