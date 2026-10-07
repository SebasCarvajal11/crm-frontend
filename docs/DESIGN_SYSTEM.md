# Sistema de Diseño CIMA: `crm-frontend`

Este documento define la identidad visual corporativa, la paleta cromática, la tipografía y los estándares de interfaz implementados con Tailwind CSS v4 y Radix UI.

---

## 1. Identidad Gráfica y Paleta de Colores

### Logotipos oficiales

La única implementación de marca es `src/components/ui/cima-logo.tsx`, que consume
los PNG oficiales de `src/assets/brand/` mediante imports de Vite (URLs con hash en
producción). No reconstruir la marca con texto ni SVG.

| Variante | Contexto | Ancho habitual de imagen |
| :--- | :--- | :--- |
| `full` | Presentación y formularios de autenticación | 220 px |
| `cimaxis` | Sidebar expandido/móvil y bienvenida del dashboard | 160 / 180 px |
| `emblem` | Sidebar colapsado | 32 px |
| `basic` | Cabecera móvil | 100 px |

Todas las variantes conservan dimensiones intrínsecas, proporciones y texto
alternativo y transparencia, sin recuadros ni fondos añadidos. `tone="inverse"`
presenta un negativo monocromático blanco del PNG mediante `brightness-0 invert`
en sidebar y panel institucional. El tono `adaptive` conserva los colores originales
en tema claro y utiliza el negativo blanco en tema oscuro. No modifica los archivos
oficiales, su geometría ni su canal alfa. El
ancho se limita al contenedor; no ampliar el PNG completo como banner 4K.
El favicon `public/favicon.png` es una copia del isotipo oficial `cima-C.png`.

La línea visual de CIMA CRM está fundamentada en tonalidades carmesí corporativas combinadas con neutros sobrios de alto contraste:

```text
┌─────────────────────────────────────────────────────────────┐
│                      Paleta Corporativa                     │
├───────────────────┬─────────────────────────────────────────┤
│ cima-red-900      │ #680609 (Sidebar principal / fondos oscuros)
│ cima-red-800      │ #86070c (Color primario de marca / botones)│
│ cima-red-700      │ #a8131a (Estados hover de primarios)    │
│ cima-red-600      │ #bd2f35 (Bordes activos y acentos)      │
│ cima-red-200      │ #f3d9da (Fondos sutiles y selección)    │
├───────────────────┼─────────────────────────────────────────┤
│ cima-ink          │ #282829 (Color principal de texto)      │
│ cima-white        │ #fefefe (Fondo general de la app)       │
│ cima-gray-50      │ #f7f7f7 (Fondos muted)                  │
│ cima-gray-100     │ #eeeeee (Bordes secundarios y separadores)
│ cima-gray-200     │ #dededf (Bordes de inputs y tarjetas)   │
│ cima-gray-400     │ #98989c (Texto desactivado / placeholders)
│ cima-gray-600     │ #626267 (Texto secundario muted)        │
└───────────────────┴─────────────────────────────────────────┘
```

---

## 2. Tipografía Corporativa

- **Fuente Primaria (Sans-Serif)**: `"Montserrat", system-ui, sans-serif`.
- **Pesos Utilizados**:
  - `Regular (400)`: Texto corrido, descripciones y valores de tablas.
  - `Medium (500)`: Etiquetas de formularios, elementos de navegación y badges.
  - `SemiBold (600)`: Subtítulos, cabeceras de columnas Kanban y botones primarios.
  - `Bold (700)`: Títulos de página, estadísticas destacadas y modales.

---

## 3. Tokens Semánticos en Tailwind CSS v4

Los componentes nunca deben utilizar colores hexadecimales fijos (*hardcoded*). Deben consumir exclusivamente las clases de utilidad semánticas declaradas en `src/index.css`:

| Utilidad | Variable CSS | Propósito |
| :--- | :--- | :--- |
| `bg-background` | `--background` | Fondo de página general |
| `text-foreground`| `--foreground` | Color del texto principal |
| `bg-primary` | `--primary` | Botones principales, enlaces activos |
| `bg-secondary` | `--secondary` | Botones secundarios, tags |
| `bg-card` | `--card` | Contenedores de tarjetas y paneles |
| `border-border` | `--border` | Bordes de inputs, divisores y tarjetas |
| `bg-sidebar` | `--sidebar` | Barra de navegación lateral fija |

---

## 4. Accesibilidad y Escalado Visual

1. **Contraste de Color (WCAG AA/AAA)**: Todo texto sobre fondo primario (`bg-primary`) utiliza texto blanco puro (`text-primary-foreground`), garantizando un ratio de contraste $> 7:1$.
2. **Zoom y Accesibilidad (`--app-zoom`)**: El hook `useAccessibilityZoom` ajusta la variable `--app-zoom` a nivel de raíz, permitiendo a usuarios con dificultades visuales escalar la interfaz sin romper la maquetación.
3. **Soporte de Modo Oscuro**: Declarado con `@custom-variant dark (&:is(.dark *))`, intercambiando automáticamente los tokens semánticos a gamas oscuras de bajo brillo.
4. **Iconografía**: Conjunto estandarizado de iconos vectoriales mediante **Lucide React**, respetando tamaños consistentes de `16px` (inputs/botones compactos) y `20px` (navegación y encabezados).

---

## 5. Composición de la pestaña Resumen

El Resumen de administradores y trabajadores usa una jerarquía editorial propia en
`src/features/overview/ui/overview.css`, limitada por `.overview-stage`. Se conserva
el encabezado de bienvenida y la información existente. Los seis indicadores
comerciales forman una franja visible completa: dos columnas en móvil, tres en
tableta y seis en pantallas amplias. Las secciones operativas usan una regla
superior, listas con separadores y una señal lateral sutil en foco o hover. Cuenta
y notificaciones se distinguen mediante fondos derivados de los tokens del tema.

Se evitó un carrusel para los indicadores porque ocultaría información y exigiría
navegación para comparar cifras. Las acciones actuales de perfil, avisos, tareas
y proyectos permanecen en su lugar. `data-tour` se ancla a las secciones y no
a posiciones de la cuadrícula, por lo que funciona con cualquier rol o ancho.
Los estados de carga y vacío conservan el mismo orden. Las transiciones se
desactivan con `prefers-reduced-motion`.

---

## 6. Directorio de Usuarios en Consola de Administración

El Directorio de Usuarios (`src/components/organisms/admin/`) implementa una experiencia visual
enriquecida e interactiva mediante un carrusel por tarjetas fluido:

- **Modo Carrusel Interactivo (Predeterminado)**: Organizado en `UserCarousel` y `AdminUserCard`.
  Utiliza CSS Scroll Snap nativo (`snap-x snap-mandatory`), gestos táctiles acelerados por hardware
  y controles ergonómicos de desplazamiento horizontal con indicadores dinámicos.
- **Línea Gráfica de Tarjetas**: Coherente con `ProjectMembers`, cada tarjeta destaca el rol
  con acento lateral (`border-l-4`), avatar determinista memorizado (`getAvatarColor`),
  badge de estado de cuenta (activo/inactivo/archivado), datos de contacto y acciones
  completas de ciclo de vida (`AdminUserActions`).
- **Modo Tabla Detallada**: Accesible mediante el selector de vista en `UserTableToolbar`
  para auditorías y consultas densas en formato tabular virtualizado.
- **Responsividad Homologada**:
  - Pantallas 2K/UHD: 4 tarjetas simultáneas.
  - Escritorio 1080p: 3 tarjetas simultáneas.
  - Tablets: 2 tarjetas simultáneas.
  - Móviles: 1 tarjeta centralizada por slide con adaptación táctil y sin desbordamiento global.

---

## 7. Arquitectura y Estandarización de Modales y Diálogos

Todos los modales y diálogos del sistema (`Dialog` y `AlertDialog`) se rigen bajo una arquitectura unificada y modular en `src/components/ui/dialog.tsx` y `src/components/ui/alert-dialog.tsx`:

- **Escala de Tamaños Tipada (`size`)**:
  - `sm` (max-w-sm / 384px): Acciones atómicas de confirmación o avisos breves.
  - `md` (max-w-md / 448px): Formularios compactos (bloqueo/desbloqueo de tareas, respuestas directas).
  - `lg` (max-w-lg / 512px): Formularios de entidad media (exportación de chat, registro de contacto, campañas).
  - `xl` (max-w-xl / 576px): Formularios estructurados y wizards (creación de proyectos, edición de tareas).
  - `2xl` (max-w-2xl / 672px): Vistas legales, términos y condiciones y configuraciones densas.
  - `3xl` / `4xl` (768px / 896px): Diálogos de firma electrónica de contratos y paneles de auditoría.
  - `5xl` / `full` (1024px / viewport): Previsualizadores de documentos PDF/imágenes e interfaces inmersivas.

- **Componentes Estructurales de Alto Orden**:
  - `DialogMedia` / `AlertDialogMedia`: Indicador semántico de cabecera con anillo de halo (`default`, `destructive`, `warning`, `success`, `info`) con colores oficiales CIMA.
  - `DialogBody`: Contenedor de contenido desacoplado con scroll vertical restringido (`max-h-[72vh]`), padding uniforme y scrollbar estilizada.
  - `DialogFooter`: Zona de interacción y botones anclada al pie, con soporte de layout invertido en móvil y alineación flexible.

- **Ergonomía, Animaciones y Compatibilidad**:
  - Curvas de interpolación `cubic-bezier(0.16, 1, 0.3, 1)` para entrada/salida suave y sin brincos de layout.
  - Gestión de áreas seguras (`safe-area-inset-top`, `safe-area-inset-bottom`) garantizando compatibilidad con Safari iOS y navegadores móviles.
  - Validación automatizada en 4 resoluciones (4K, 1080p, Tablet, Mobile) vía Playwright.

---

## 8. Distribución de Espacios y Paneles de Trabajo (Colaboración y Administración)

- **Conversación y Chat de Proyecto**:
  - Altura elástica fluida (`h-full min-h-0 flex-1 flex-col`) en escritorio y móvil.
  - Contenedor de mensajes con scroll interno independiente (`overflow-y-auto scrollbar-thin`).
  - Barra de entrada de texto fijada al pie con sugerencias de menciones flotantes accesibles.
- **Solicitudes de Cambio**:
  - Ancho completo adaptable (`w-full`) con distribución en cuadrícula (`grid-cols-1 xl:grid-cols-2`).
  - Supresión de anchos fijos restrictivos (`max-w-5xl`) para evitar márgenes laterales vacíos en monitores amplios.
- **Brief y Registro de Cambios Formales**:
  - Cuadrícula asimétrica balanceada con altura mínima estandarizada (`min-h-[520px] lg:min-h-[580px]`).
  - Estados vacíos con diseño editorial, iconos con opacidad sutil y tipografía equilibrada.
- **Consola de Administración (Centro de Incorporación y Gobernanza)**:
  - Arquitectura Master-Detail en cuadrícula de 12 columnas en escritorio (`lg:grid-cols-12 items-start gap-6`):
    - Columna Principal (7 cols): Formulario de emisión de invitaciones (`AdminInviteForms`).
    - Columna de Soporte (5 cols): Tarjeta de alcances y privilegios en vivo (`RolePrivilegesCard`), que
      reacciona al cambio de rol, y tarjeta de protocolo de seguridad institucional (`InviteSecurityCard`).
    - Elimina los espacios muertos laterales en 1080p/2K/4K y colapsa fluidamente en móviles y tablets.

---

## 9. Sistema de Avatares Oficiales y Entrega Gráfica de Alta Fidelidad

El sistema de avatares corporativos (`UserAvatar`, `AvatarPickerDialog`, `AcceptInviteAvatarCard`) garantiza máxima nitidez visual y coherencia estética en todas las densidades de pantalla:

- **Encuadre Cuadrado 1:1 y Zona de Seguridad**:
  - Máster generado en lienzo 1024x1024 con margen superior de seguridad (8-10%) y centrado anatómico.
  - Elimina la mutilación de cabelleras y coronillas al renderizar dentro de contenedores circulares CSS (`rounded-full`, `object-cover`).
- **Antialiasing Subpíxel Analógico y Defringing**:
  - Máscara alpha continua de 256 niveles de opacidad mediante gradiente euclidiano, eliminando bordes dentados ("serrucho") sobre fondos corporativos CIMA.
  - Inpainting perimetral Navier-Stokes para suprimir halos de fringe/spill de compresión.
- **Entrega Responsiva Multinivel (`srcSet` / Mipmaps)**:
  - Generación de activos escalonados en `64px`, `256px`, `512px` y `1024px` tanto en WebP como en PNG.
  - Atributos `srcSet` y `sizes` automáticos en `AvatarMedia` adaptados a viewports móviles (`sizes="32px"` a `"48px"`), paneles de escritorio (`sizes="64px"`) y modales de previsualización 2K/4K (`sizes="128px"` a `"256px"`).
- **Garantía Zero-Null y Fondos Corporativos**:
  - Determinismo universal en ausencia de avatar explícito (`getAvatarColor`, iniciales legibles).
  - Integración nativa con los 12 tonos oficiales CIMA.
