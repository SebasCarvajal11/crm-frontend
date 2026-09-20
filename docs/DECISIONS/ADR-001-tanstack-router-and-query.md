# ADR-001: Enrutamiento Basado en Archivos con TanStack Router y Caché con TanStack Query

- **Estado**: Aceptado
- **Fecha**: 2026-05-12
- **Autores**: Equipo de Frontend y Experiencia de Usuario CIMA

---

## Contexto y Planteamiento del Problema

La aplicación cliente de CIMA CRM maneja múltiples flujos de usuario concurrentes: tableros Kanban interactivos, hilos de chat con polling, listados de contratos y paneles de administración con filtros avanzados en URL (`?tab=...&page=...`).

Abordar esto con soluciones tradicionales (React Router + Redux Toolkit) presentaba problemas:
1. Rutas y parámetros de búsqueda sin tipado estricto, provocando errores en tiempo de ejecución por nombres de clave tipografiados incorrectamente.
2. Inmensa sobrecarga de código repetitivo (*boilerplate*) en Redux para sincronizar estados remotos del servidor (estados de carga, error y caché).

---

## Alternativas Evaluadas

### Opción 1: React Router v6 + Redux Toolkit
- **Descripción**: El stack clásico de React.
- **Desventajas**: Requiere escribir reducers y thunks manuales para cada endpoint; sincronización compleja y propensa a inconsistencias entre la URL y el store global.

### Opción 2: Next.js (App Router / SSR)
- **Descripción**: Framework fullstack con renderizado del lado del servidor.
- **Desventajas**: CIMA CRM sigue una arquitectura estricta de microservicios con API Gateway (KrakenD). Introducir un servidor intermedio Node.js para SSR añadía latencia, complejidad de despliegue y desalineación con el modelo de SPA estática servida por Nginx.

### Opción 3 (Elegida): TanStack Router + TanStack Query v5
- **Descripción**: TanStack Router proporciona enrutamiento basado en archivos con seguridad de tipos total en rutas y *search params* (validados con Zod). TanStack Query v5 asume por completo la gestión del estado del servidor (caché, reintentos, refetching en background y mutaciones optimistas).

---

## Decisión

Adoptar la **Opción 3**:
1. Implementar TanStack Router con su plugin de Vite para generación automática de rutas en `routeTree.gen.ts`.
2. Validar todos los parámetros de consulta de URL con esquemas Zod en `validateSearch`.
3. Delegar en TanStack Query v5 toda la consulta y mutación de APIs REST, utilizando query keys estandarizadas.
4. Reducir el estado global local a un almacén mínimo en Zustand (únicamente para sesión activa y preferencias visuales).

---

## Consecuencias

### Positivas
- **Type Safety Absoluto**: Errores en nombres de rutas o parámetros detectados inmediatamente por el compilador TypeScript.
- **Cero Boilerplate de Servidor**: TanStack Query elimina la necesidad de reducers manuales para llamadas HTTP.
- **URL como Fuente de Verdad**: Los filtros de búsqueda, pestañas y paginaciones son serializados y compartibles directamente por enlace.

### Negativas
- **Curva de Aprendizaje**: Los desarrolladores deben familiarizarse con los paradigmas y APIs específicas de TanStack Router.
