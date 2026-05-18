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

By default the frontend uses `VITE_API_BASE_URL=/api` and proxies `/api` to the gateway. For local multi-repo development, point `VITE_API_PROXY_TARGET` to the active `crm-infra` gateway, typically `http://localhost:18080`.

## Environment

Start from [`./.env.example`](./.env.example).

The frontend should only know the gateway contract:

- `VITE_API_BASE_URL`
- `VITE_API_PROXY_TARGET`

It should not be coupled directly to `crm-auth`, `crm-collab`, or `crm-media`.

## Runtime Notes

- Development proxy behavior is defined in [`./vite.config.ts`](./vite.config.ts)
- Container/runtime proxy behavior is defined in [`./nginx.conf`](./nginx.conf)
