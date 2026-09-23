import type { CimaTourDefinition, GuidedQuestion } from '../model/types'

export const marketingTour: CimaTourDefinition = {
  id: 'tour-marketing',
  tab: 'marketing',
  title: 'Recorrido del Módulo de Marketing',
  description: 'Conoce cómo gestionar tus campañas, propuestas comerciales y automatizaciones de clientes.',
  roles: ['admin', 'worker'],
  steps: [
    {
      element: '[data-tour="marketing-header"]',
      title: 'Estrategia y Crecimiento',
      description: 'Panel de control principal para supervisar la ejecución de campañas de marketing y relaciones comerciales.',
      actionHint: 'Consulta este encabezado para verificar el módulo activo.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="marketing-tabs"]',
      title: 'Secciones Estratégicas',
      description: 'Alterna ágilmente entre Clientes, Campañas, Propuestas, Automatizaciones, Segmentos e Interacciones.',
      actionHint: 'Haz clic en cualquier pestaña para ver su detalle operativo.',
      side: 'bottom',
      align: 'center',
      showPointer: true,
    },
    {
      element: '[data-tour="marketing-new-campaign-btn"]',
      fallbackElement: '[data-tour="marketing-tabs"]',
      title: 'Crear una Campaña',
      description: 'Inicia el asistente para redactar, segmentar y programar un nuevo envío o lanzamiento a tus clientes.',
      actionHint: 'Pulsa el botón Nueva Campaña para configurar el objetivo y fechas.',
      side: 'bottom',
      align: 'end',
      showPointer: true,
    },
  ],
}

export const marketingQuestions: GuidedQuestion[] = [
  {
    id: 'mkt-q1',
    question: '¿Cómo creo una nueva campaña publicitaria?',
    answer: 'En la sección de Campañas, haz clic en el botón superior "+ Nueva Campaña", asigna el nombre, objetivo y fechas de lanzamiento.',
    tab: 'marketing',
    roles: ['admin', 'worker'],
    category: 'gestion',
    targetElement: '[data-tour="marketing-new-campaign-btn"]',
    fallbackTargetElement: '[data-tour="marketing-tabs"]',
  },
  {
    id: 'mkt-q2',
    question: '¿Dónde puedo ver el resumen de crecimiento de marketing?',
    answer: 'En el encabezado de Marketing y Analítica dispones del panorama general de actividad de la empresa.',
    tab: 'marketing',
    roles: ['admin', 'worker'],
    category: 'flujo',
    targetElement: '[data-tour="marketing-header"]',
  },
  {
    id: 'mkt-q3',
    question: '¿Cómo alterno entre clientes, propuestas y automatizaciones?',
    answer: 'Utiliza la barra de pestañas para acceder a Clientes, Campañas, Propuestas, Automatizaciones, Segmentos e Interacciones.',
    tab: 'marketing',
    roles: ['admin', 'worker'],
    category: 'flujo',
    targetElement: '[data-tour="marketing-tabs"]',
  },
]
