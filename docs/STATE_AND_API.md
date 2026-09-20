# Estado y Conectividad API: `crm-frontend`

Este documento describe la gestión de estado del servidor con TanStack Query v5, el cliente HTTP Ky, el almacén de sesión local con Zustand y el tratamiento de errores y rotación de tokens.

---

## 1. Separación de Estado: Servidor vs. Cliente

El frontend aplica una estricta separación entre el estado remoto del servidor y el estado local de la interfaz:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Estado del Servidor                      │
│                  (TanStack Query v5)                        │
│ • Proyectos, tareas, comentarios, mensajes de chat y briefs.│
│ • Caché en memoria con staleTime y revalidación automática. │
│ • Mutaciones optimistas con invalidación selectiva.         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Estado del Cliente                      │
│                        (Zustand v5)                         │
│ • Sesión en memoria (Access Token volátil, usuario activo). │
│ • Preferencias de interfaz (sidebar colapsada, tema oscuro).│
│ • Ajustes de accesibilidad (escala de zoom).                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Cliente HTTP Centralizado: `ky`

Toda comunicación hacia el backend se realiza mediante la instancia configurada de `ky` en `src/shared/api/api-client.ts`:

### A. Interceptor de Peticiones (`beforeRequest`)
- Inyecta automáticamente el Access Token en la cabecera `Authorization: Bearer <token>` si el usuario está autenticado en memoria.
- Propaga `X-Trace-Id` y `X-Correlation-Id` generados en el cliente para mantener la trazabilidad distribuida.

### B. Interceptor de Respuestas y Rotación Transparente (`afterResponse`)
```text
[ Petición HTTP ] ──► (Respuesta 401 Unauthorized)
                             │
                             ▼
                 [ POST /api/v1/auth/refresh ]
                 (Usa cookie httpOnly con rotación)
                             │
                 ┌───────────┴───────────┐
                 ▼                       ▼
            (Exitoso)                (Fallido)
    [ Actualizar Access Token ]  [ Limpiar sesión en Zustand ]
    [ Reintentar petición original ] [ Redirigir a /login ]
```

---

## 3. Convención de Claves en TanStack Query

Para garantizar que las invalidaciones de caché sean precisas y no produzcan refetching innecesario:

| Recurso | Query Key Canónica |
| :--- | :--- |
| Lista de proyectos | `['projects', 'list']` |
| Detalle de proyecto | `['projects', projectId]` |
| Tablero Kanban | `['projects', projectId, 'board']` |
| Mensajes de chat | `['chat', projectId, channel]` |
| Contrato de proyecto | `['projects', projectId, 'contract']` |
| Perfil del usuario | `['identity', 'me']` |

### Mutaciones Optimistas
Al mover una tarjeta en el tablero Kanban o enviar un mensaje de chat, la interfaz actualiza el caché de TanStack Query inmediatamente (`onMutate`), mostrando el cambio visual sin esperar la respuesta de red. Si el servidor responde con error, se restaura el estado previo (*rollback*).
