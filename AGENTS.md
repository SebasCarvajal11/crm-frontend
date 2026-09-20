# Guía de Agentes: `crm-frontend`

Este archivo es el **enrutador principal para Agentes de Inteligencia Artificial**. La documentación técnica y de diseño completa y detallada está estructurada en la carpeta [`docs/`](./docs/README.md).

---

## Misión de la Aplicación

`crm-frontend` es la **Single Page Application (SPA) web oficial de CIMA CRM**, desarrollada con React 19, Vite, TanStack Router y TanStack Query. Su misión es ofrecer una interfaz gráfica fluida, reactiva, accesible y respetuosa de la identidad visual corporativa, comunicándose **exclusivamente a través del API Gateway KrakenD**.

---

## Enrutamiento Documental para Agentes

Antes de proponer o ejecutar cambios, consulta el documento especializado correspondiente a tu objetivo:

| Si tu tarea involucra... | Consulta este documento |
| :--- | :--- |
| Comprender la arquitectura en capas, Atomic Design y módulos de features | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| Aplicar la paleta corporativa carmesí, tipografía, Tailwind v4 y tokens | [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) |
| Agregar o modificar rutas en `src/routes`, layouts o search params Zod | [`docs/ROUTING_AND_NAVIGATION.md`](./ROUTING_AND_NAVIGATION.md) |
| Gestionar caché TanStack Query, llamadas con Ky o sesión Zustand | [`docs/STATE_AND_API.md`](./docs/STATE_AND_API.md) |
| Modificar o auditar rutas de API backend en `gateway-routes.ts` | [`docs/GATEWAY_CONTRACT.md`](./docs/GATEWAY_CONTRACT.md) |
| Ejecutar o crear pruebas unitarias Vitest o flujos E2E Playwright | [`docs/TESTING.md`](./docs/TESTING.md) |
| Entender decisiones estructurales (TanStack Router, Atomic Design, POM) | [`docs/DECISIONS/`](./docs/DECISIONS/README.md) |

---

## Reglas Inviolables para Agentes de IA

1. **Gestor Único**: Utiliza **exclusivamente `pnpm`**. Jamás uses `npm` ni generes archivos `package-lock.json`.
2. **Cero Conexión Directa a Microservicios**: Todas las llamadas de red deben dirigirse al API Gateway KrakenD utilizando las constantes de `src/shared/lib/gateway-routes.ts`.
3. **Respeto a la Línea Gráfica**: Utilizar únicamente tokens semánticos corporativos (`bg-primary`, `cima-red-800`, `text-foreground`). Prohibido introducir colores arbitrarios.
4. **Cero Lógica de Negocio Primaria**: La lógica de negocio, validaciones transaccionales y cobros pertenecen exclusivamente a los microservicios backend.
5. **Auditoría Obligatoria**: Cualquier nueva ruta de API debe registrarse en `gateway-routes.ts` y aprobar `pnpm audit:gateway-routes`.
