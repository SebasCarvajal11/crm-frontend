# Panel de presencia

## Arquitectura

Auth es propietario de identidad, roles, sesiones y política de presencia. Ver
[ADR y contrato del backend](../../crm-auth/docs/PRESENCE.md). El frontend usa
`features/presence`: API validada con Zod, bucle de señales cancelable, hooks de
disponibilidad y consulta, y presentación independiente. No hay WebSockets,
conexiones persistentes ni una segunda lista de usuarios.

La aplicación autenticada y visible envía señales propias. Web Locks y una
marca temporal en localStorage coordinan pestañas, sin guardar tokens ni perfiles.
El servidor impone el límite real de escrituras. Las señales no se solapan, se
cancelan al desmontar y aplican backoff ante fallos. Se pausan sin red o con la
pestaña oculta y se reanudan al volver.

Solo el administrador ve la tercera burbuja del dashboard. La lectura requiere
autorización también en Auth; esconder el componente no es el control de acceso.
Cada panel abierto consulta con TanStack Query; cerrado no consulta ni conserva
caché de presencia. Las claves incluyen la identidad, búsqueda y páginas por
perfil. Al cambiar de identidad o rol se desmonta el panel; un 401/403 retira
los datos y detiene el intervalo. Datos antiguos o sin red indican «Sin confirmar».

## Interfaz y significado

Se agrupa en colaboradores, clientes y otros administradores, con páginas
independientes. La política y tamaños se reciben del servidor. La búsqueda global
se aplica con debounce, abarca nombre completo, correo/alias y empresa, y reinicia
las páginas. Los conectados preceden a los recientemente desconectados. No se
inventa una fecha exacta de desconexión: se muestra última actividad y último acceso.
La ventana histórica contiene señales recibidas desde que se publica la función.

Las tres burbujas comparten `FloatingActionContainer`, que corrige el zoom de la
aplicación, separación y safe area. El diálogo conserva tokens corporativos,
modo oscuro, foco inicial en el título, cierre visible, Escape y retorno de foco.
Un único scroll interior mantiene el encabezado y cierre disponibles; visualViewport
ajusta los límites con teclado y rotación. El tutorial se suspende durante el panel.

Referencias de accesibilidad: [diálogos WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
y [tamaño mínimo de controles WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).

## Verificación

`pnpm test:unit` verifica DTO, fechas y bucle de señales. `pnpm test:ui` compila
producción y ejecuta marca, tutorial y presencia antes de CD. Presencia incluye
4K, 2K, 1080p, ultrawide, iPad/iPhone WebKit y Android Chromium, todos emulados.
Se comprueban segmentación, búsqueda, paginación, vacío, desconexiones, pérdida
de permisos/red, pausas de polling, zoom, viewport reducido, rotación y convivencia
con el tutorial. Las capturas y reportes se publican como artefactos de CI.
El backend añade pruebas contra PostgreSQL real y RBAC HTTP/Hurl.
