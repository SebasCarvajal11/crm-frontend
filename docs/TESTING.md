# Estrategia de Pruebas: `crm-frontend`

Este documento describe la pirámide de pruebas, la suite de pruebas End-to-End (E2E) con Playwright por roles (*personas*) y las herramientas de auto-reparación (*self-healing*).

---

## 1. Pirámide de Pruebas Frontend

```text
       ▲
      / \     Nivel 3: Pruebas E2E por Personas (Playwright: Admin, Worker, Client, Guest)
     /   \
    /─────\   Nivel 2: Validación de Contratos y Auditoría (`audit:gateway-routes`, `lint`)
   /       \
  /─────────\ Nivel 1: Pruebas Unitarias Aisladas (Vitest: Hooks, Utilidades, Zod)
```

### Nivel 1: Pruebas Unitarias (`pnpm test:unit`)
- **Herramienta**: Vitest.
- **Alcance**: Funciones puras, formateadores de fecha/moneda, esquemas Zod de búsqueda, hooks de accesibilidad y lógica de menciones en chat.
- **Ejecución**: Pruebas instantáneas en memoria sin dependencias de navegador ni backend.

### Nivel 2: Auditoría de Contratos de API (`pnpm audit:gateway-routes`)
- Comprueba que toda llamada HTTP del frontend esté mapeada a un endpoint activo en los manifiestos del API Gateway KrakenD.

### Nivel 3: Pruebas E2E con Playwright (`pnpm test:e2e`)
- **Herramienta**: `@playwright/test`.
- **Arquitectura de Page Object Model (POM)**: Clases especializadas (`LoginPage`, `DashboardPage`, `ProjectPage`, `TaskPage`, `ChatPage`) que aíslan la manipulación del DOM de las aserciones de prueba.

---

## 2. Pruebas por Personas / Roles

Para validar que cada tipo de usuario experimente las restricciones y permisos correctos:

| Proyecto Playwright | Comando | Roles y Flujos Validados |
| :--- | :--- | :--- |
| **`admin`** | `pnpm test:e2e:admin` | Dashboard general, gestión de usuarios, roles, logs de auditoría. |
| **`worker`** | `pnpm test:e2e:worker` | Tableros Kanban, creación y arrastre de tareas, chat de equipo (`team`). |
| **`client`** | `pnpm test:e2e:client` | Portal de cliente, aprobación de entregables, firma de contratos y chat (`client`). |
| **`guest`** | `pnpm test:e2e:guest` | Pantalla de login, flujo de olvido de contraseña y aceptación de invitaciones. |

---

## 3. Motor de Auto-Reparación (*Self-Healing Runner*)

Playwright en `crm-frontend` incorpora un mecanismo inteligente de detección y corrección de selectores rotos (`tests/playwright/helpers/self-healer.ts`):

```bash
pnpm test:e2e:heal           # Ejecuta la suite y auto-repara selectores fallidos
pnpm test:e2e:heal:worker    # Auto-reparación enfocada en el proyecto worker
pnpm test:e2e:heal:dry       # Simula reparaciones sin modificar el código fuente
```

Si un selector de botón o input cambia ligeramente en el DOM pero su texto o atributo semántico de accesibilidad sigue presente, el analizador detecta la alternativa más robusta y propone un parche automático para el Page Object correspondiente.

---

## 4. Catálogo de Comandos de Validación

| Comando | Propósito | Requisitos de Entorno |
| :--- | :--- | :--- |
| `pnpm test:unit` | Pruebas unitarias de funciones puras y hooks. | Ninguno (autocontenido) |
| `pnpm lint` | Validación de ESLint y reglas de React Hooks. | Ninguno |
| `pnpm build` | Compilación de Vite y verificación estricta de TypeScript. | Ninguno |
| `pnpm audit:gateway-routes` | Auditoría de rutas frontend vs. manifests KrakenD. | Repositorios hermanos |
| `pnpm test:e2e` | Ejecución completa de suites Playwright en headless. | Stack Docker activo |
| `pnpm test:e2e:ui` | Interfaz interactiva de Playwright con inspector visual. | Stack Docker activo |
| `pnpm test:e2e:report` | Visualización del reporte HTML de la última corrida. | Ninguno |
