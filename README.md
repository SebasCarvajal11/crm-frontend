# CRM Frontend

> SPA web del CIMA CRM — React + Vite + TanStack Query.

## Propósito

`crm-frontend` es la interfaz de usuario del CIMA CRM. Implementa autenticación, gestión de cuenta, flujos de colaboración, administración y upload de medios. Se comunica **exclusivamente a través de KrakenD** (nunca directamente con `crm-auth`, `crm-collab` o `crm-media`). La composición de datos se realiza en el cliente con TanStack Query (`Promise.all` paralelos).

## Entorno

```bash
cp .env.example .env
```

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_API_BASE_URL` | URL base del API (vacío = mismo origen en producción) | Dev |
| `VITE_API_PROXY_TARGET` | Gateway local para proxy Vite en dev | Dev |

Ver [`.env.example`](./.env.example).

> **Regla de arquitectura**: El frontend NO debe conocer las URLs directas de `crm-auth`, `crm-collab` ni `crm-media`. Toda petición pasa por el gateway.

## Local

```bash
pnpm install
pnpm dev     # servidor Vite en :5173 (proxy /api → gateway :18080)
```

Comandos útiles:

```bash
pnpm lint           # ESLint + TypeScript check
pnpm build          # build de producción (dist/)
pnpm preview        # preview del build de producción
pnpm audit:routes   # validar que gateway-routes.ts cubre todos los manifests
```

Para desarrollo con el stack completo (infraestructura Docker + servicios en host):

```bash
# Desde crm-infra/
docker compose up -d postgres_db redis clamav-scanner
# Luego en cada servicio backend:
pnpm dev
# Y en crm-frontend:
pnpm dev
```

## Deploy

El frontend se sirve como contenedor Nginx con el build de producción:

```bash
# Desde crm-infra/
./deploy/remote/deploy-component.sh frontend
```

El proxy de producción está definido en [`nginx.conf`](./nginx.conf). Ver [crm-infra/ONBOARDING.md](../crm-infra/ONBOARDING.md).

## Tests

```bash
pnpm lint            # linting
pnpm build           # verifica que el build compile sin errores
pnpm audit:routes    # valida que las rutas del frontend coinciden con los manifests del gateway
```

Los tests E2E cross-stack están orquestados desde `crm-infra` (Playwright).

## Contrato con el gateway

Las rutas públicas se definen en [`src/shared/lib/gateway-routes.ts`](./src/shared/lib/gateway-routes.ts). Este archivo es la **única fuente de verdad** para las URLs de API que usa el frontend. Usar `pnpm audit:routes` para verificar que cada ruta tenga su endpoint en el gateway manifest correspondiente.
