# Intranet Tennis Pro Sport

Intranet simple para gestionar el inventario y los horarios de los empleados.

Hecha con Next.js y Supabase (base de datos e inicio de sesión).

## Puesta en marcha

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En Supabase, abre **SQL Editor** y ejecuta el contenido de `supabase/migrations/0001_perfiles.sql`.
3. En **Authentication > Sign In / Providers**, desactiva "Allow new users to sign up" para que solo entren personas invitadas.
4. En **Authentication > Users**, crea tu usuario (Add user). **El primer usuario queda como administrador.**
5. Copia `.env.example` como `.env.local` y completa la URL y la anon key (Project Settings > API).
6. Instala y levanta la app:

   ```bash
   npm install
   npm run dev
   ```

   Abre http://localhost:3000.

## Roles

- **Administrador**: ve y gestiona a todos los empleados (y luego inventario y turnos).
- **Empleado**: entra a la intranet y ve su información.

Para sumar empleados, invítalos desde Supabase (Authentication > Users > Invite user). Entran como empleado y el administrador puede cambiar su rol en la página **Empleados**.
