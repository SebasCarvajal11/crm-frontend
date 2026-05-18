# AGENTS

## Purpose

`crm-frontend` is the browser client for CIMA CRM. It presents authentication, account, collaboration, admin, and media workflows through a single SPA that must remain coupled only to the gateway contract.

## System Boundaries

- Owns browser-side UI, route composition, session bootstrap, and interaction flows.
- Owns feature modules for auth, collaboration, admin, media, and BFF-facing views.
- Depends on the gateway as its only backend entrypoint in normal operation.
- Must not embed direct service topology or service-specific host assumptions into feature code.

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
