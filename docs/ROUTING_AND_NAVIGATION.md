# Enrutamiento y Navegación: `crm-frontend`

Este documento describe la arquitectura de enrutamiento basada en archivos de TanStack Router, la validación de parámetros con Zod y los protectores de navegación (*route guards*).

---

## 1. Arquitectura de Rutas con TanStack Router

El frontend utiliza **TanStack Router**, un enrutador 100% tipado en TypeScript con soporte nativo para rutas basadas en el sistema de archivos (`src/routes/`):

```text
src/routes/
├── __root.tsx                 # Layout raíz (Providers, Toaster, Shell global)
├── index.tsx                  # Redirección inteligente según estado de sesión
├── login.tsx                  # Pantalla de autenticación
├── forgot-password.tsx        # Solicitud de restablecimiento
├── reset-password.tsx         # Cambio de contraseña mediante token
├── accept-invite.$token.tsx   # Parámetro dinámico en URL ($token)
├── verify-email.tsx           # Verificación de correo electrónico
└── dashboard.tsx              # Shell autenticado (Sidebar, Header y <Outlet />)
    └── dashboard/             # Sub-rutas de proyectos, tareas, chat y admin
```

El archivo `routeTree.gen.ts` es generado automáticamente por el plugin `@tanstack/router-plugin` en Vite y **nunca debe modificarse manualmente**.

---

## 2. Validación Tipada de Search Params (Zod)

Para garantizar que los parámetros de consulta en la URL (`?tab=...&page=...&filter=...`) sean seguros y tipados:

1. **Esquema Zod de Búsqueda**:
   ```typescript
   export const dashboardSearchSchema = z.object({
     project: z.string().uuid().optional(),
     tab: z.enum(["board", "chat", "contract", "brief"]).default("board"),
     search: z.string().optional(),
   });
   ```
2. **Validación en la Ruta**:
   ```typescript
   export const Route = createFileRoute("/dashboard")({
     validateSearch: (search) => dashboardSearchSchema.parse(search),
     component: DashboardPage,
   });
   ```
3. **Navegación Type-Safe**: Al invocar `navigate({ search: (prev) => ({ ...prev, tab: 'chat' }) })`, TypeScript valida que solo se envíen valores permitidos por el esquema Zod.

---

## 3. Protectores de Ruta y Ciclo de Vida (*Route Guards*)

Para evitar que usuarios sin autenticar accedan a áreas privadas o que usuarios autenticados vean la pantalla de login:

- **Hook `beforeLoad`**: Se ejecuta antes de renderizar la ruta. Comprueba el estado de la sesión en memoria o invoca la validación de credenciales:
  ```typescript
  export const Route = createFileRoute("/dashboard")({
    beforeLoad: async ({ context, location }) => {
      if (!context.auth.isAuthenticated) {
        throw redirect({
          to: "/login",
          search: { redirect: location.href },
        });
      }
    },
  });
  ```
- **Control de Acceso por Rol**: Si un usuario con rol `cliente` intenta navegar a una ruta restringida a administradores (`/dashboard/admin`), el guard intercepta la navegación y redirige a su vista correspondiente.
