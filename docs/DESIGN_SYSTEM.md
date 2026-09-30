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
