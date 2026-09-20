# ADR-003: Centralización de Contratos de API en `gateway-routes.ts` y Auditoría en CI

- **Estado**: Aceptado
- **Fecha**: 2026-06-20
- **Autores**: Equipo de Plataforma y Frontend CIMA

---

## Contexto y Planteamiento del Problema

En un ecosistema multi-repositorio donde los microservicios evolucionan de forma independiente, el frontend corre el riesgo continuo de:
1. Llamar a rutas obsoletas o modificadas en el backend, descubriendo el error recién en producción (*drift de contrato*).
2. Esparcir strings de URLs en decenas de componentes y hooks (`fetch('/api/v1/auth/login')`, `fetch('/api/v1/users')`).
3. Intentar comunicarse directamente con puertos internos de microservicios en lugar de utilizar el API Gateway.

---

## Alternativas Evaluadas

### Opción 1: URLs Literales Descentralizadas
- **Descripción**: Escribir la URL directamente en cada hook de TanStack Query o llamada de API.
- **Desventajas**: Imposible auditar de forma automatizada; refactorizaciones complejas y propensas a errores humanos.

### Opción 2: Clientes SDK Autogenerados Exclusivos
- **Descripción**: Generar una librería SDK completa en TypeScript desde OpenAPI para cada servicio.
- **Desventajas**: Añade fricción de publicación de paquetes en repositorios privados y acopla el bundle del frontend al ciclo de compilación del SDK.

### Opción 3 (Elegida): Centralización en `gateway-routes.ts` con Auditoría Estática
- **Descripción**: Declarar un único archivo canónico `src/shared/lib/gateway-routes.ts` que agrupe todas las rutas públicas del API Gateway. Complementar con un script de auditoría (`pnpm audit:gateway-routes`) en el pipeline de CI que compara las rutas del frontend contra los archivos `gateway.manifest.json` del backend.

---

## Decisión

Adoptar la **Opción 3**:
1. Todas las llamadas HTTP en `crm-frontend` deben importar sus URLs desde `gateway-routes.ts`.
2. Ejecutar `scripts/audit-gateway-routes.mjs` en el pipeline de CI/CD para validar:
   - Que ningún archivo en `src/` use URLs literales que no pasen por el contrato central.
   - Que cada ruta declarada coincida unívocamente con un endpoint publicado en el manifiesto de KrakenD de los microservicios.
3. El build del frontend falla de forma inmediata si existe discrepancia de rutas con el backend.

---

## Consecuencias

### Positivas
- **Prevención de Errores de Integración**: Cero peticiones a endpoints inexistentes o renombrados.
- **Transparencia**: Los desarrolladores y agentes de IA disponen de un catálogo exacto de endpoints disponibles en un solo archivo.
- **Desacoplamiento Topológico**: El frontend desconoce los nombres y puertos internos de los microservicios; solo conoce rutas del Gateway.

### Negativas
- **Paso Adicional**: Todo nuevo endpoint requiere agregarse en `gateway-routes.ts` antes de poder ser consumido en la UI.
