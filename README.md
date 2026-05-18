# crm-frontend

Frontend del CRM CIMA, separado del monorepo para operar como repositorio independiente.

## Requisitos

- Node.js 22+
- `pnpm`
- `crm-infra` corriendo con KrakenD disponible en `http://localhost:18080`

## Desarrollo local

1. Instalar dependencias:

```bash
pnpm install
```

2. Crear `.env` a partir de `.env.example` si necesitas overrides.

3. Iniciar el entorno de desarrollo:

```bash
pnpm dev
```

Por defecto el frontend consume `VITE_API_BASE_URL=/api` y Vite redirige `/api` a KrakenD. Si `crm-infra` está aislado en su puerto de migración, usa:

```env
VITE_API_PROXY_TARGET=http://localhost:18080
```

## Build

```bash
pnpm build
```

## Despliegue

- `nginx.conf` sirve la SPA y reenvía `/api` a `api-gateway:8080`.
- Para integración local multi-repo, el frontend solo debe conocer el gateway; no debe acoplarse directo a `auth`, `collab` o `media`.
