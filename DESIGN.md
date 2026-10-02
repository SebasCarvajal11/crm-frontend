---
name: CIMA CRM Design System
description: Sistema de diseño corporativo y especificación visual para CIMA CRM (Tailwind CSS v4 & Radix UI)
colors:
  primary: "#86070c"
  primary-hover: "#a8131a"
  primary-active: "#680609"
  primary-accent: "#bd2f35"
  accent-subtle: "#f3d9da"
  neutral-bg: "#fefefe"
  neutral-surface: "#ffffff"
  neutral-muted: "#f7f7f7"
  neutral-border-subtle: "#eeeeee"
  neutral-border: "#dededf"
  neutral-text: "#282829"
  neutral-text-muted: "#626267"
  neutral-text-disabled: "#98989c"
  sidebar-bg: "#680609"
  sidebar-text: "#fefefe"
  sidebar-border: "rgba(255, 255, 255, 0.16)"
  destructive: "#ba1a1a"
typography:
  display:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  base:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  caption:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
  micro:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.01em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "20px"
---

# CIMA CRM — Sistema de Diseño Canónico

## Overview
CIMA CRM es una plataforma modular orientada al modo **Operate**. La interfaz prioriza la velocidad de escaneo, la consistencia de controles y la densidad informativa sin sobrecarga cognitiva. Toda superficie está diseñada para facilitar la toma de decisiones ejecutivas y operativas, manteniendo la sobriedad y elegancia de la marca corporativa CIMA.

## Colors
La paleta se divide estrictamente entre la gama carmesí institucional y una jerarquía de neutros de alto contraste (WCAG AAA):

- **Marca e Interacción Primaria**:
  - `primary` (`#86070c` / `var(--cima-red-800)`): Botones principales, enlaces activos, acento de navegación.
  - `primary-hover` (`#a8131a` / `var(--cima-red-700)`): Estados hover de elementos primarios.
  - `primary-active` (`#680609` / `var(--cima-red-900)`): Fondos de sidebar y estados activos presionados.
  - `primary-accent` (`#bd2f35` / `var(--cima-red-600)`): Acentos y bordes activos seleccionados.
  - `accent-subtle` (`#f3d9da` / `var(--cima-red-200)`): Fondos de selección sutil y tags de marca.
- **Neutros y Superficies**:
  - `neutral-bg` (`#fefefe`): Fondo general de la aplicación.
  - `neutral-surface` (`#ffffff`): Fondo de tarjetas y paneles modales.
  - `neutral-muted` (`#f7f7f7`): Fondos secundarios y cabeceras de tabla.
  - `neutral-border` (`#dededf`): Delimitación perimetral de tarjetas, inputs y separadores.
  - `neutral-text` (`#282829`): Color principal de texto (máximo contraste).
  - `neutral-text-muted` (`#626267`): Texto secundario y metadatos.
  - `neutral-text-disabled` (`#98989c`): Placeholders e indicadores deshabilitados.
- **Tema Oscuro**:
  - Intercambio de tokens vía `@custom-variant dark`: superficies neutras profundas (`#1b1b1c`, `#252526`), con textos contrastantes en blanco puro y acento primario ajustado a `#df5a5f`.

## Typography
La tipografía oficial es **Montserrat** (`"Montserrat", system-ui, sans-serif`):
- **Pesos autorizados**:
  - `Regular (400)`: Texto corrido, descripciones, valores de campos.
  - `Medium (500)`: Badges, labels de formularios, navegación secundaria.
  - `SemiBold (600)`: Títulos de sección, cabeceras de columnas Kanban, botones.
  - `Bold (700)`: Títulos de página, métricas y cifras destacadas.
- **Reglas Tipográficas**:
  - Medida de lectura en prosa: 60–75 caracteres (`max-w-prose`).
  - Tracking en encabezados: `-0.02em` a `-0.025em` para tipografía compacta y refinada.
  - Cifras y métricas: obligatorio el uso de `tabular-nums` para alineación vertical perfecta en datos numéricos, fechas y contadores.

## Layout
- **Estructura Shell**: Barra lateral fija (`AppShell`) con estado expandido (`240px`), colapsado (`64px`) y modo drawer deslizante en pantallas móviles.
- **Contenedores y Cuadrículas**:
  - Estructura adaptativa según 4 niveles de pantalla: 4K/2K (hasta 6 columnas o distribución amplia), 1080p (cuadrículas estándar de 3-4 columnas), tablet (2-3 columnas), móvil (1 columna apilada).
  - Espaciado rítmico basado en múltiplos de 4px/8px (`gap-4`, `gap-6`, `p-6`). Prohibido el espaciado aleatorio.
  - Proximidad semántica: agrupar elementos por significado antes de recurrir a contenedores artificiales.

## Elevation & Depth
- **Regla de Elevación Única**: Cada contenedor declara su elevación a través de **un solo mecanismo**:
  - O bien un borde perimetral sutil (`border border-border`) sobre fondo neutro,
  - O bien una sombra suave con desenfoque natural (`shadow-xs` / `shadow-sm`).
  - Prohibido el "ghost card" (borde rígido de 1px combinado con sombra extendida sin desenfoque).
- **Prohibición de Neobrutalismo**: Cero sombras duras (`box-shadow: 4px 4px 0`) o halos circulares sin desplazamiento.

## Shapes
- **Radios de Esquina**:
  - `sm` (`4px`): Badges pequeños, tags y controles ultracompactos.
  - `md` (`6px`): Botones compactos, inputs y selectores.
  - `lg` (`8px`): Tarjetas principales, modales y hojas deslizantes (Sheets).
  - `xl` (`12px`): Contenedores macro y paneles flotantes de navegación.
  - `full` (`9999px`): Avatares, badges de notificación e indicadores de estado.

## Components
- **Botones (`Button`)**:
  - Primario: Fondo `var(--primary)`, texto blanco puro, respuesta activa sutil (`active:scale-[0.985]`).
  - Secundario / Outline: Borde semántico neutro, fondo transparente con hover en `var(--muted)`.
  - Ghost: Sin bordes, solo hover para acciones terciarias.
- **Tarjetas Interactivas**:
  - Elevación suave en reposo, elevación refinada al hover (`translateY(-2px)`, `shadow-md`), sin modificar márgenes ni paddings internos.
- **Estados de Carga**: Skeletons estructurados que replican la geometría del contenido final; prohibido colocar spinners flotantes en medio de vistas en blanco.
- **Estados Vacíos**: Ilustrativos y orientados a la acción siguiente con título, descripción concisa y botón primario de inicio.

## Do's and Don'ts
- **DO**: Usar exclusivamente tokens semánticos de Tailwind CSS (`bg-primary`, `text-foreground`, `border-border`).
- **DO**: Probar cada interfaz en los 4 escenarios de resolución (4K/2K, 1080p, Tablet iPad, Mobile iPhone Safari y Chrome Android).
- **DO**: Utilizar curvas de desaceleración exponencial (`cubic-bezier(0.16, 1, 0.3, 1)`) para transiciones de 150–250ms.
- **DON'T**: Usar anti-patrones como bordes acentuados unilaterales (`border-l-4`), rebotes elásticos (`animate-bounce`), o gradientes en texto.
- **DON'T**: Reconstruir logotipos con texto o SVGs improvisados; usar siempre `CimaLogo` con los activos oficiales de `src/assets/brand/`.
- **DON'T**: Animar propiedades de layout como `padding`, `margin`, `width` o `height` que fuercen repintado en el navegador.
