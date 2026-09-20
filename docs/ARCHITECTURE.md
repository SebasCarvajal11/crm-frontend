# Arquitectura Frontend: `crm-frontend`

Este documento detalla la estructura en capas, el diseño atómico de componentes, los módulos por funcionalidad (*features*) y el despliegue de la SPA con Nginx.

---

## 1. Estructura en Capas y Organización de Código

El código fuente en `src/` sigue una separación estricta de responsabilidades:

```text
┌─────────────────────────────────────────────────────────────┐
│                          src/app                            │
│           (Proveedores globales, Router, Sesión)            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         src/routes                          │
│        (Enrutamiento basado en archivos TanStack Router)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         src/pages                           │
│           (Composición de vistas y orquestación)            │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│        src/features         │ │       src/components        │
│  (Módulos de Negocio: auth, │ │   (Jerarquía Atomic Design: │
│   collab, marketing, admin) │ │  atoms, molecules, orgs, ui)│
└──────────────┬──────────────┘ └──────────────┬──────────────┘
               │                               │
               └───────────────┬───────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                         src/shared                          │
│    (Cliente Ky, gateway-routes.ts, utilidades, tipos base)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Jerarquía de Componentes: Atomic Design

Para garantizar consistencia visual y reutilización sin acoplamiento:

1. **`components/atoms`**: Elementos visuales básicos e indivisibles (botones, inputs, badges, avatares, contadores, spinners).
2. **`components/molecules`**: Agrupaciones simples de átomos con un propósito funcional específico (campos de formulario con etiqueta y error, barras de búsqueda, dropdowns de usuario).
3. **`components/organisms`**: Secciones complejas de la interfaz que combinan moléculas y átomos (tablero Kanban de tareas, panel de chat con lista de mensajes, cabecera de proyecto, tablas de usuarios).
4. **`components/templates`**: Estructuras de layout sin datos (shell del dashboard con sidebar y navbar, plantilla de pantalla dividida, vista de autenticación).
5. **`components/ui`**: Primitivas accesibles basadas en Radix UI adaptadas a los estándares de CIMA CRM.

---

## 3. Módulos por Dominio (*Features*)

Cada carpeta dentro de `src/features/` encapsula su propia lógica de presentación, hooks personalizados, consultas de TanStack Query y tipos locales:

- **`features/auth`**: Formularios de login, restablecimiento de contraseña, aceptación de invitaciones y validación de sesiones activas.
- **`features/collab`**: Tableros Kanban interactivos, drag-and-drop de tareas, comentarios, hilos de chat con menciones, generación y firma de contratos/otrosíes.
- **`features/marketing`**: Visualización de campañas, audiencias y plantillas.
- **`features/admin`**: Gestión de usuarios, roles de plataforma, suspensión y registros de auditoría.
- **`features/overview`**: Métricas generales, resumen de actividad y widgets del dashboard principal.
- **`features/accessibility`**: Control de zoom, alto contraste y preferencias de navegación asistida.

---

## 4. Despliegue de Producción con Nginx

En producción, la aplicación se compila a activos estáticos (`dist/`) servidos mediante un contenedor **Nginx**:

- **SPA Fallback**: Configuración `try_files $uri $uri/ /index.html` para permitir la navegación interna de TanStack Router sin errores 404 al recargar la página.
- **Políticas de Caché**:
  - `index.html`: `Cache-Control: no-cache, no-store, must-revalidate` (garantiza que los usuarios reciban siempre el último build).
  - Activos con hash (`/assets/*`): `Cache-Control: public, max-age=31536000, immutable`.
- **Compresión y Seguridad**: Compresión Gzip habilitada, encabezados de seguridad HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) y proxy transparente de `/api` hacia KrakenD Gateway.
