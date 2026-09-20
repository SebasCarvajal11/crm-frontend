# ADR-002: Adopción de Atomic Design y Tailwind CSS v4 para el Sistema de Diseño CIMA

- **Estado**: Aceptado
- **Fecha**: 2026-05-30
- **Autores**: Equipo de Diseño y Frontend CIMA

---

## Contexto y Planteamiento del Problema

Para asegurar una línea gráfica corporativa coherente entre múltiples desarrolladores y agentes de IA, se requería una metodología de organización de componentes y un motor de estilos que evitara:
1. Fragmentación visual (botones o modales con estilos dispares en distintas pantallas).
2. Clases CSS huérfanas o duplicación de estilos inline.
3. Componentes "monolito" con miles de líneas donde la UI está acoplada al negocio.

---

## Alternativas Evaluadas

### Opción 1: CSS Modules Tradicionales
- **Descripción**: Escribir archivos `.module.css` para cada componente.
- **Desventajas**: Dificulta mantener tokens corporativos consistentes; alta verbosidad y riesgo de desviación de la paleta.

### Opción 2: Librería UI de Terceros Cerrada (Material UI o Ant Design)
- **Descripción**: Importar componentes prediseñados y sobreescribir estilos.
- **Desventajas**: Sobrecarga pesada en el bundle final; dificultad para aplicar la línea gráfica carmesí exacta de CIMA y personalizaciones avanzadas de Kanban.

### Opción 3 (Elegida): Atomic Design + Primitivas Radix UI + Tailwind CSS v4
- **Descripción**: Estructurar los componentes visuales según Atomic Design (`atoms`, `molecules`, `organisms`, `templates`), usando Radix UI para accesibilidad sin estilos y Tailwind CSS v4 con tokens semánticos corporativos en `src/index.css`.

---

## Decisión

Adoptar la **Opción 3**:
1. Organizar `src/components/` estrictamente en átomos, moléculas, organismos y plantillas.
2. Adoptar **Tailwind CSS v4** mediante su plugin nativo en Vite (`@tailwindcss/vite`), eliminando archivos de configuración JavaScript obsoletos.
3. Centralizar los tokens de marca (`--cima-red-800`, `--cima-ink`, `--background`) en variables CSS nativas consumidas por clases de utilidad semánticas (`bg-primary`, `text-foreground`).
4. Basar los componentes accesibles y complejos (dropdowns, diálogos, tabs) en primitivas sin estilos de **Radix UI**.

---

## Consecuencias

### Positivas
- **Consistencia Visual Automática**: Es imposible desviarse de la línea gráfica si los componentes consumen tokens semánticos.
- **Rendimiento de Compilación Extremo**: Tailwind CSS v4 compila en milisegundos sin sobrecarga de configuración.
- **Accesibilidad Nativa**: Radix UI garantiza navegación por teclado y soporte para lectores de pantalla de acuerdo con estándares WAI-ARIA.

### Negativas
- **Disciplina Requerida**: Los desarrolladores deben clasificar conscientemente los componentes en el nivel adecuado de la jerarquía atómica.
