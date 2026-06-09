# AGENTS

## Purpose

`crm-frontend` is the browser client for CIMA CRM. It presents authentication, account, collaboration, admin, and media workflows through a single SPA that must remain coupled only to the gateway contract.

## System Boundaries

- Owns browser-side UI, route composition, session bootstrap, and interaction flows.
- Owns feature modules for auth, collaboration, admin, media, and BFF-facing views.
- Depends on the gateway as its only backend entrypoint in normal operation.
- Must not embed direct service topology or service-specific host assumptions into feature code.

## Fronteras con otros servicios

- **Upstream**: API Gateway (KrakenD) que consolida y expone los endpoints de los servicios de autenticación (`crm-auth`), colaboración (`crm-collab`) y multimedia (`crm-media`).
- **Downstream**: Ninguno.
- **Pares**: N/A.
- **Recursos Compartidos**: Ninguno directo.
- **Fuera de mi responsabilidad**: No contiene ni ejecuta reglas de negocio, persistencia de datos primarios, validación criptográfica de tokens (delegado en los backends), ni escaneo de virus/malware. Su único propósito es presentar la interfaz de usuario de forma fluida.

## Architecture Rules

- Preserve the layering between `app`, `routes`, `pages`, `features`, `components`, and `shared`.
- Keep routes thin. They should delegate to pages rather than contain business logic.
- Feature UI should not perform raw HTTP calls directly. Domain-facing API usage belongs in feature API/hooks layers.
- Shared code must remain domain-agnostic and must not depend back on feature modules.
- Session restoration, API retries, and refresh handling are cross-cutting concerns and should stay centralized rather than duplicated across features.

## Code Organization

- `src/app`: app-wide providers, session bootstrap, and router wiring.
- `src/routes`: TanStack Router route definitions.
- `src/pages`: page-level composition with light orchestration.
- `src/features`: domain-focused modules for auth, collab, media, admin, and BFF concerns.
- `src/components`: reusable UI building blocks and composed interface pieces.
- `src/shared`: stable types, API client utilities, and framework-agnostic helpers.

## Operational Rules

- The frontend must talk to the platform through the gateway only.
- Keep `vite.config.ts` and `nginx.conf` aligned so dev and deployed proxy semantics stay consistent.
- Generated router artifacts such as `routeTree.gen.ts` are part of the toolchain contract and should not be hand-edited.
- Avoid hardcoded environment-specific URLs inside feature code.

## Development Rules

- Use `pnpm` only. Never add `npm` commands, lockfiles, or documentation.
- Keep documentation minimal: only `README.md` and this file.
- Preserve build and lint health when cleaning or restructuring the UI.
- If the frontend architecture evolves, encode the active boundaries here rather than leaving migration notes scattered around the repo.


## Frontend Boundaries & Business Logic Restrictions

This section enforces the restrictions on frontend capabilities to maintain a clean decoupling from backend domain logic:

- **No Business Logic**: The frontend must act strictly as a presentation and user interaction layer. It must not implement business validation, billing calculations, or state transitions that belong to microservices.
- **Single Backend Endpoint**: The frontend must communicate exclusively with the API Gateway (or BFF). It must never connect directly to individual microservices or external databases.
- **No Direct WebSockets/SSE**: For real-time updates, the frontend must consume events through dedicated, gateway-routed Server-Sent Events (SSE) or WebSockets endpoints (e.g., exposed by the BFF or a gateway aggregator). Direct WebSockets or SSE connections to individual microservice ports are strictly prohibited.
- **Authorization Enforcement**: The frontend must not make primary authorization decisions. While it can hide/show UI elements based on the roles/claims received in the JWT token or auth state, the backend is the sole authority for security. The frontend must gracefully handle `401 Unauthorized` and `403 Forbidden` responses.
- **State Separation**: Do not replicate or sync complex business state across different feature modules in the browser. Each feature module must manage its own API state using localized query caches (e.g., TanStack Query) without sharing mutable global data stores.
