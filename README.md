# CRM Frontend

> SPA web oficial para CIMA CRM — React 19, Vite, TanStack Router y Tailwind CSS v4.

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Platform](https://img.shields.io/badge/platform-CIMA%20CRM-blue.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D22.0.0-green.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

---

## Propósito

`crm-frontend` es la interfaz web unificada de CIMA CRM. Ofrece las experiencias interactivas de autenticación, tableros Kanban, chat en tiempo real con canales segregados, administración de usuarios y gestión de archivos. Se comunica **exclusivamente a través del API Gateway KrakenD** y delega toda la lógica de negocio a los microservicios backend.

---

## Documentación Detallada (`docs/`)

Para consultar las especificaciones técnicas completas y guías de arquitectura frontend, visita la suite documental:

- [**Arquitectura Frontend (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md): Diseño en capas, Atomic Design, subdominios de features y Nginx.
- [**Sistema de Diseño CIMA (`docs/DESIGN_SYSTEM.md`)**](./docs/DESIGN_SYSTEM.md): Paleta carmesí corporativa, tipografía Montserrat y Tailwind CSS v4.
- [**Enrutamiento y Navegación (`docs/ROUTING_AND_NAVIGATION.md`)**](./docs/ROUTING_AND_NAVIGATION.md): TanStack Router, layouts y search params con Zod.
- [**Estado y Conectividad API (`docs/STATE_AND_API.md`)**](./docs/STATE_AND_API.md): Caché con TanStack Query v5, cliente Ky y sesión en Zustand.
- [**Contrato con el Gateway (`docs/GATEWAY_CONTRACT.md`)**](./docs/GATEWAY_CONTRACT.md): Centralización en `gateway-routes.ts` y auditoría en CI.
- [**Estrategia de Pruebas (`docs/TESTING.md`)**](./docs/TESTING.md): Pruebas unitarias Vitest, Playwright E2E por personas y motor auto-reparador.
- [**Decisiones Arquitectónicas (`docs/DECISIONS/`)**](./docs/DECISIONS/README.md): Registros formales de decisiones (ADRs).

---

## Inicio Rápido Local

### 1. Configuración de Entorno
```bash
cp .env.example .env
# Configurar variables locales o ejecutar pnpm setup:env desde crm-infra
```

### 2. Instalación y Servidor de Desarrollo
```bash
pnpm install
pnpm dev                      # servidor Vite en http://localhost:5173
```

---

## Pruebas y Validación de Calidad

```bash
pnpm lint                     # análisis estático ESLint y reglas React Hooks
pnpm test:unit                # pruebas unitarias aisladas con Vitest
pnpm audit:gateway-routes     # auditoría de rutas frontend vs. manifests KrakenD
pnpm test:e2e                 # pruebas E2E con Playwright (requiere stack activo)
pnpm test:e2e:heal            # ejecución E2E con auto-reparación de selectores
pnpm build                    # compilación de producción y validación de tipos
```

---

## Despliegue en Producción

El frontend se empaqueta como una imagen Nginx que sirve los activos estáticos compilados y proxea las peticiones `/api` al Gateway:

```bash
# Desde crm-infra/
./deploy/remote/deploy-component.sh frontend
```
