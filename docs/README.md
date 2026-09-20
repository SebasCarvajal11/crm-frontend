# Documentación Técnica: `crm-frontend`

Bienvenido a la documentación oficial de la aplicación web cliente de **CIMA CRM** (`crm-frontend`). Esta aplicación es una Single Page Application (SPA) desarrollada con React 19, Vite y TypeScript, diseñada para interactuar **exclusivamente a través del API Gateway KrakenD** y presentar una experiencia visual unificada, responsiva y accesible.

---

## Índice de Documentación

| Documento | Audiencia Principal | Descripción |
| :--- | :--- | :--- |
| [**ARCHITECTURE.md**](./ARCHITECTURE.md) | Arquitectos / Frontend | Diseño en capas, Atomic Design, estructura de features y reverse proxy Nginx. |
| [**DESIGN_SYSTEM.md**](./DESIGN_SYSTEM.md) | Diseñadores / Frontend | Identidad gráfica CIMA, paleta de colores, tipografía, Tailwind CSS v4 y Radix. |
| [**ROUTING_AND_NAVIGATION.md**](./ROUTING_AND_NAVIGATION.md) | Desarrolladores Frontend | TanStack Router, rutas basadas en archivos, search params con Zod y route guards. |
| [**STATE_AND_API.md**](./STATE_AND_API.md) | Desarrolladores Frontend | TanStack Query v5, cliente HTTP Ky, Zustand para sesión y manejo de errores. |
| [**GATEWAY_CONTRACT.md**](./GATEWAY_CONTRACT.md) | Arquitectos / Backend | Centralización en `gateway-routes.ts`, auditoría con CLI y codegen OpenAPI. |
| [**TESTING.md**](./TESTING.md) | QA / Desarrolladores | Pruebas unitarias Vitest, Playwright E2E por personas y motor de auto-reparación. |
| [**DECISIONS/**](./DECISIONS/README.md) | Todo el equipo | Architecture Decision Records (ADRs) que sustentan el diseño de la interfaz. |

---

## Guía Rápida de Navegación para Agentes de IA

Si eres un **agente autónomo**, consulta directamente el archivo correspondiente a tu objetivo:

- **Modificar o agregar vistas, layouts o páginas**: Consulta [`ROUTING_AND_NAVIGATION.md`](./ROUTING_AND_NAVIGATION.md) y [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- **Crear o estilizar componentes de UI**: Consulta [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).
- **Consumir endpoints del backend o mutaciones**: Consulta [`GATEWAY_CONTRACT.md`](./GATEWAY_CONTRACT.md) y [`STATE_AND_API.md`](./STATE_AND_API.md).
- **Ajustar la gestión de autenticación, cookies o sesión**: Consulta [`STATE_AND_API.md`](./STATE_AND_API.md).
- **Ejecutar o escribir pruebas unitarias o flujos Playwright**: Consulta [`TESTING.md`](./TESTING.md).
- **Consultar fundamentos y decisiones técnicas**: Consulta [`DECISIONS/`](./DECISIONS/README.md).

---

## Reglas Inviolables del Repositorio

1. **Gestor Único**: Únicamente `pnpm`. Prohibido usar `npm` o generar archivos `package-lock.json`.
2. **Cero Conexión Directa a Microservicios**: El frontend **jamás se comunica directamente** con `crm-auth`, `crm-collab` o `crm-media`. Toda llamada pasa por el API Gateway KrakenD.
3. **Respeto a la Línea Gráfica Corporativa**: Respetar estrictamente la paleta de colores, tipografía y componentes del Design System CIMA.
4. **Contrato Único de Rutas**: Toda URL de backend debe invocarse a través de `src/shared/lib/gateway-routes.ts` y verificarse con `pnpm audit:gateway-routes`.
5. **Cero Lógica de Negocio Primaria**: El frontend es una capa pura de presentación e interacción; las reglas de negocio, cobro y autorización pertenecen a los microservicios.
