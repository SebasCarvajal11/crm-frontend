# Tutorial híbrido y centro de ayuda

## Decisión arquitectónica (2026-09-28)

El CRM usa React y la URL del dashboard como fuente de verdad para la sección,
el proyecto y la subpestaña de trabajo. Las guías deben acompañar la operación
real, respetar los permisos y nunca crear, enviar ni eliminar datos por sí solas.

La auditoría encontró instancias Driver.js controladas desde un hook sin
teardown, avance manual y automático por caminos distintos, finalización al
cerrar, temporizadores de escritura que avanzaban durante la edición,
selección de paneles retenidos pero ocultos, listeners de viewport sin
desuscripción efectiva y CSS que intentaba deshacer el bloqueo del overlay.
Marketing reutilizaba metadatos de workspace; las preguntas globales no
preparaban sus destinos y el recorrido integral referenciaba un ID inexistente.

Se evaluaron tres opciones:

1. Corregir cada supervisor manteniendo Driver.js: conservaría dos propietarios
   del foco y restricciones del overlay incompatibles con formularios reales.
2. Centralizar Driver.js detrás de un controlador: mejoraría la navegación,
   pero seguiría requiriendo excepciones a su capa modal.
3. Un controlador React y una guía no modal: elegido porque elimina la disputa
   de foco y permite interacciones reales sin introducir un segundo motor de estados.

## Fuente de verdad y responsabilidades

- **Registro**: definiciones y pasos compartidos, roles, contexto explícito
  kanban/workspace, pestañas de Marketing y selectores declarativos.
- **tour-session.ts**: sesión inmutable, filtrado de roles, índices válidos,
  revisión de preparación y pasos realmente visitados.
- **tour-store.ts**: comandos, sesión única, búsqueda e historial por cuenta.
  No manipula el DOM ni mantiene instancias de navegación.
- **use-tour-runner.ts**: comandos de inicio y ayuda contextual.
- **TourRuntime**: único propietario montado de navegación, AbortController,
  observadores, listeners, interacción, resaltado y posición.
- **tour-target.ts**: resolución visible y cancelable; descarta paneles ocultos,
  ancestros inert/aria-hidden y elementos desconectados.
- **Floating UI DOM**: posición en escritorio con flip y desplazamiento en ambos
  ejes. En móvil, una tarjeta inferior de hasta el 42% del viewport conserva libre
  la navegación y reserva su altura en el dashboard. visualViewport actualiza
  sus límites durante cambios de tamaño, desplazamiento y apertura del teclado.
  Al explicar un control fijo inferior, la tarjeta se sitúa arriba para permitir
  operar ese control (por ejemplo, el zoom o el menú de usuario).
  En un viewport móvil inferior a 340 px de altura, conserva el paso en una
  tarjeta compacta para evitar recortar controles mientras el teclado ocupa espacio.
- **Dialog compartido (Radix)**: centro de ayuda con título, descripción,
  cierre por teclado, foco controlado y un solo contenedor de desplazamiento.

## Contrato de interacción

El avance es explícito: escribir, Enter, cambios de filtros y clics no saltan
pasos. Las acciones se observan sin interceptarlas. Los formularios y sheets
suspenden la tarjeta y el resaltado; al cerrar reaparece el mismo paso.
La tarjeta puede minimizarse y abrir el centro de ayuda conservando la sesión.
Escape cierra la guía cuando no existe un diálogo de la aplicación.

Cada siguiente, anterior o reintento usa el mismo preparador. Solo se automatiza
navegación declarada: sección, subpestaña, menú móvil o apertura de un proyecto
visible. No se pulsa un botón arbitrario dentro de un fallback ni se limpia
un filtro escrito por el usuario. Si el usuario abre un proyecto distinto,
el recorrido trabaja sobre ese proyecto.

Un objetivo inexistente o temporalmente oculto presenta un estado recuperable
con reintento y omisión. Un fallback explica el contexto y nunca se interpreta
como una interacción completada con el control original. La observación permite
recuperar el objetivo cuando el usuario cambia filtros o selecciona datos.

Cerrar, reemplazar, perder la sesión o salir del dashboard cancela sin completar.
Finalizar solo registra progreso si todos los pasos autorizados tuvieron un
objetivo visible. Omitir pasos y finalizar cierra la guía conservando el historial
sin añadir una finalización falsa. Los callbacks tardíos no pueden visitar una
sesión nueva: se validan contra su revisión.

## Historial

El formato v2 usa una clave por cuenta: `cima_tour_v2:<cuenta codificada>`.
El historial anterior no se importa porque el motor antiguo marcaba como
completados incluso recorridos cerrados. Cambiar de cuenta carga su historial y
cancela cualquier sesión anterior. El almacenamiento restringido no impide operar.

## Diseño y compatibilidad

Se usan los tokens corporativos del tema y la tipografía compartida. La guía no
oscurece ni bloquea el dashboard, respeta movimiento reducido y utiliza controles
de 44 px para minimizar, ayuda y cierre. La tarjeta permanece dentro del viewport
visible, con cuerpo desplazable y controles persistentes. La escala interna de
la aplicación no distorsiona las coordenadas de la guía; el zoom del navegador
continúa siendo compatible.
El centro de ayuda ajusta sus límites a la escala interna conservando el tamaño
ampliado del texto y el desplazamiento del contenido.

## Validación

`pnpm test:unit` valida roles, cancelación, revisiones tardías, límites,
finalización real, almacenamiento corrupto y aislamiento de cuentas.
`pnpm test:tour` compila producción y ejecuta las integraciones de navegador.
`pnpm test:ui` ejecuta marca y tutorial sobre una sola compilación y es obligatorio
en CI antes de CD.
Cada combinación de guía y rol se valida de forma aislada para evitar acumular
el tiempo de todos los recorridos en un único caso. CI reparte la matriz completa
en tres shards, conserva los mismos controles y publica un reporte por shard.

La matriz visual incluye 4K, 2K, 1080p, iPad/WebKit, iPhone/WebKit y Pixel/Chromium.
La suite recorre todas las guías autorizadas para los tres roles y verifica
escritura, formularios, subpestañas retenidas, búsqueda entre secciones,
retroceso, proyectos vacíos, cancelación, modo oscuro, rotación y zoom.
Las API son fixtures: no se alteran datos de producción. Los motores emulados
no equivalen a dispositivos físicos; los E2E generales contra KrakenD siguen
siendo la validación del contrato con servicios reales.
