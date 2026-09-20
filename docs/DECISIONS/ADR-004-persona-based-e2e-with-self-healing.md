# ADR-004: Pruebas End-to-End Segregadas por Personas con Motor de Auto-Reparación

- **Estado**: Aceptado
- **Fecha**: 2026-07-10
- **Autores**: Equipo de QA y Frontend CIMA

---

## Contexto y Planteamiento del Problema

CIMA CRM implementa control de acceso basado en roles contextuales (`admin`, `worker`, `client`, `guest`). Las pantallas y flujos varían sustancialmente según la identidad autenticada.

Las suites tradicionales de pruebas E2E enfrentaban dos desafíos:
1. Pruebas monolíticas que mezclaban roles en la misma sesión, provocando contaminación de estado y ejecuciones lentas.
2. Fragilidad en los selectores (*flaky tests*): Pequeños cambios en clases CSS de Tailwind o estructura de etiquetas rompían las pruebas aunque la funcionalidad estuviera intacta.

---

## Alternativas Evaluadas

### Opción 1: Pruebas E2E Monolíticas sin Segregación
- **Descripción**: Una sola suite secuencial que inicia sesión como administrador, crea registros y luego cambia de usuario.
- **Desventajas**: Si el primer paso falla, el resto de la suite colapsa; difícil paralelización e identificación de fallos de permisos específicos.

### Opción 2: Suites Estándar de Cypress
- **Descripción**: Utilizar Cypress con selectores convencionales de clases e IDs.
- **Desventajas**: Mayor consumo de tiempo de ejecución en CI y constante mantenimiento manual ante refactorizaciones estéticas de Tailwind.

### Opción 3 (Elegida): Playwright por Proyectos de Personas con Motor Self-Healing
- **Descripción**: Configurar `@playwright/test` dividiendo los flujos en proyectos independientes según el rol del usuario (`admin`, `worker`, `client`, `guest`). Incorporar un runner de auto-reparación (`self-healer.ts`) que analiza el árbol DOM cuando un selector falla y sugiere o aplica el selector accesible más resiliente.

---

## Decisión

Adoptar la **Opción 3**:
1. Implementar `tests/playwright/playwright.config.ts` segregando los tests en 4 proyectos dedicados: `admin`, `worker`, `client` y `guest`.
2. Utilizar el patrón **Page Object Model (POM)** en `tests/playwright/page-objects/` para centralizar la interacción con la UI.
3. Incorporar el script `pnpm test:e2e:heal` para inspeccionar selectores rotos y generar parches automáticos basados en roles ARIA y atributos de accesibilidad (`getByRole`, `getByText`).

---

## Consecuencias

### Positivas
- **Aislamiento Total de Roles**: Cada suite de persona corre de forma independiente y paralela.
- **Mantenimiento Drásticamente Reducido**: El motor de auto-reparación reduce los falsos positivos por cambios estéticos en el frontend.
- **Fidelidad al Usuario**: Las pruebas simulan el comportamiento e interacciones reales de cada tipo de usuario en la plataforma.

### Negativas
- **Complejidad del Runner**: El motor de auto-reparación requiere mantenimiento propio dentro del repositorio.
