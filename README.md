# Intranet Tennis Pro Sport

Intranet simple para gestionar el inventario y los horarios de los empleados.

Hecha con Next.js y Supabase (base de datos e inicio de sesión).

## Puesta en marcha

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En Supabase, abre **SQL Editor** y ejecuta, en orden, el contenido de `supabase/migrations/0001_perfiles.sql` y `supabase/migrations/0002_inventario_horarios.sql`.
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

- **Administrador**: agrega y quita productos, asigna turnos y gestiona a los empleados.
- **Empleado**: suma o resta stock con los botones − y + del inventario y ve sus propios turnos.

## Pantallas

- **Inventario**: búsqueda por nombre o código, filtro por categoría y ajuste rápido de stock. Los productos en o bajo su mínimo se marcan como "Bajo / Agotado".
- **Horarios**: quién trabaja hoy y el tablero de la semana, con navegación entre semanas.

Para sumar empleados, invítalos desde Supabase (Authentication > Users > Invite user). Entran como empleado y el administrador puede cambiar su rol en la página **Empleados**.
