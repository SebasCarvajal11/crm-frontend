# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19, Vite, Tailwind CSS, Shadcn UI, Ky, TypeScript

## Users

- **Clientes**: Seguimiento de proyectos, gestión de solicitudes y comunicación directa.
- **Trabajadores / Operadores**: Gestión de tableros Kanban, chat colaborativo en tiempo real, actas y flujos de aprobación.
- **Administradores**: Supervisión de la plataforma, auditoría y control de identidades y accesos (RBAC).

## Product Purpose

Plataforma empresarial de CRM modular multi-servicio orientada a dominios con contratos estrictos, diseñada para unificar la gestión comercial, la colaboración interna y los flujos operativos.

## Positioning

Solución modular de alto rendimiento desacoplada mediante API Gateway y eventos asíncronos (Redis Streams), proporcionando trazabilidad rigurosa y escalabilidad independiente por servicio frente a CRMs monolíticos.

## Operating Context

Entornos corporativos de escritorio y dispositivos móviles. Interacción continua con tableros de proyectos, flujos de subida/previsualización de archivos protegidos, mensajería instantánea y paneles de métricas.

## Capabilities and Constraints

- Interfaz web SPA (Single Page Application) en `crm-frontend`.
- Comunicación con el backend a través de API Gateway KrakenD (`crm-infra`).
- Autenticación mediante tokens JWT firmados con RS256 y roles granulares.
- Tipado y esquemas canónicos compartidos mediante contratos Zod (`cima-contracts`).

## Brand Commitments

- Identidad corporativa CIMA: sobria, moderna y enfocada en la eficiencia operativa.
- Diseño limpio, legible, con alta densidad informativa sin saturación visual.

## Product Principles

1. **Claridad sobre adorno**: Cada elemento visual debe facilitar la toma de decisiones o la ejecución de tareas.
2. **Respuesta inmediata y estados explícitos**: Toda acción asíncrona debe comunicar su progreso, éxito o error de forma inequívoca.
3. **Consistencia modular**: Reutilizar rigurosamente los tokens de diseño y componentes base (Shadcn UI y Tailwind CSS).
4. **Legibilidad y accesibilidad**: Mantener contraste cromático adecuado y jerarquía tipográfica estricta para jornadas de trabajo prolongadas.
