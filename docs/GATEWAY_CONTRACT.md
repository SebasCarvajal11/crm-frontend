# Contrato con el API Gateway: `crm-frontend`

Este documento describe la centralización de rutas de backend, la auditoría automática de contratos y la generación de tipos estáticos desde OpenAPI.

---

## 1. Centralización en `src/shared/lib/gateway-routes.ts`

Para garantizar que el frontend **jamás acople su código a la topología interna de microservicios**:

1. **Fuente Única de la Verdad**: Todas las URLs a las que el cliente realiza peticiones HTTP deben estar declaradas en `src/shared/lib/gateway-routes.ts`.
2. **Constantes Tipadas**:
   - `AUTH_ROUTES`: Login, refresh, reseteo de contraseña, aceptación de invitaciones.
   - `IDENTITY_ROUTES`: Perfil `/identity/me`, logout, búsqueda de colaboradores.
   - `PROJECT_ROUTES`: CRUD de proyectos, tableros, contratos, otrosíes y miembros.
   - `TASK_ROUTES`: Tareas, columnas, subtareas, comentarios y asignaciones.
   - `CHAT_ROUTES`: Canales de chat (`team`, `client`), lectura de mensajes y estado de tipeo.
   - `MEDIA_ROUTES`: Avatares de usuario y URLs prefirmadas de documentos.
3. **Prohibición de URLs Literales**: Ningún componente ni hook de feature puede contener URLs "a mano" como `fetch('/api/v1/auth/login')`. Debe usarse `AUTH_ROUTES.login`.

---

## 2. Auditoría Automatizada: `pnpm audit:gateway-routes`

Para prevenir que cambios en el backend rompan silenciosamente la interfaz de usuario:

```bash
pnpm audit:gateway-routes
```

### Comprobaciones que Realiza el Script:
- **Auditoría de Invocaciones**: Escanea el código fuente de `src/` verificando que toda llamada HTTP (`apiClient.get`, `apiClient.post`, etc.) utilice referencias de `gateway-routes.ts`.
- **Paridad con Manifiestos de Backend**: Compara cada ruta declarada en `gateway-routes.ts` contra los archivos `gateway.manifest.json` de `crm-auth`, `crm-collab`, `crm-media` y `crm-marketing`. Si un microservicio elimina o renombra un endpoint, la auditoría falla inmediatamente en el CI.

---

## 3. Generación de Tipos y Modelos de Dominio (OpenAPI Codegen)

El frontend define sus tipos y modelos de datos en `src/features/*/model/` y `src/shared/types/`. Opcionalmente, para regenerar contratos desde especificaciones OpenAPI 3.0 cuando el API Gateway está en ejecución en `http://localhost:28080`:

```bash
pnpm codegen:auth      # Genera contratos desde /api/v1/docs/auth/openapi.yaml
pnpm codegen:collab    # Genera contratos desde /api/v1/docs/collab/openapi.yaml
pnpm codegen:media     # Genera contratos desde /api/v1/docs/media/openapi.yaml
pnpm codegen:all       # Regenera todos los contratos de tipos
```

> **Nota:** La ejecución de `codegen:*` requiere que el Gateway KrakenD se encuentre levantado y accesible. En desarrollo diario y CI, el tipado se rige por los contratos e interfaces desacopladas en cada feature.
