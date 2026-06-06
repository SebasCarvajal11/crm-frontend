# CRM Frontend

`crm-frontend` is the CIMA CRM web client.

## Scope

- browser UI for authentication, account management, collaboration, admin flows, and media interactions
- client-side routing and session bootstrap
- integration with the platform only through the gateway contract
- production SPA delivery through Nginx

## Local Development

```bash
pnpm install
pnpm dev
```

Useful commands:

- `pnpm lint`
- `pnpm build`
- `pnpm preview`

By default the frontend uses same-origin API calls with `VITE_API_BASE_URL=`. Public gateway routes are absolute and centralized in `src/shared/lib/gateway-routes.ts`, for example `/api/v1/auth/login`.

For local multi-repo development, Vite proxies `/api/*` to the active `crm-infra` gateway without rewriting the path. Point `VITE_API_PROXY_TARGET` to the gateway, typically `http://localhost:28080` for the local Docker stack.

## Environment

Start from [`./.env.example`](./.env.example).

The frontend should only know the gateway contract:

- `VITE_API_BASE_URL`
- `VITE_API_PROXY_TARGET`

It should not be coupled directly to `crm-auth`, `crm-collab`, or `crm-media`.

## Runtime Notes

- Development proxy behavior is defined in [`./vite.config.ts`](./vite.config.ts)
- Container/runtime proxy behavior is defined in [`./nginx.conf`](./nginx.conf)
