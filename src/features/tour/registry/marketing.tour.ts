import type { CimaTourDefinition, GuidedQuestion } from '../model/types'

export const marketingTour: CimaTourDefinition = {
  id: 'tour-marketing',
  tab: 'marketing',
  title: 'Recorrido del Módulo de Marketing',
  description: 'Conoce cómo gestionar tus campañas, listas de contactos y plantillas de comunicación.',
  roles: ['admin', 'worker'],
  steps: [
    {
      element: '[data-tour="marketing-header"]',
      title: 'Campañas de Marketing',
      description: 'Panel de control para supervisar la ejecución de campañas de correo y mensajería.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="marketing-tabs"]',
      title: 'Pestañas de Marketing',
      description: 'Alterna entre Campañas activas, Audiencias/Contactos y Plantillas de diseño.',
      side: 'bottom',
      align: 'center',
      showPointer: true,
    },
    {
      element: '[data-tour="marketing-new-campaign-btn"]',
      title: 'Crear una Campaña',
      description: 'Inicia el asistente para redactar y programar un nuevo envío masivo a tus clientes.',
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
    answer: 'Haz clic en el botón superior "+ Nueva Campaña", selecciona tu audiencia objetivo y redacta el mensaje.',
    tab: 'marketing',
    roles: ['admin', 'worker'],
    category: 'gestion',
    targetElement: '[data-tour="marketing-new-campaign-btn"]',
  },
  {
    id: 'mkt-q2',
    question: '¿Dónde puedo ver las métricas de apertura de correos?',
    answer: 'En la lista de campañas, cada tarjeta muestra el porcentaje de entrega, tasa de apertura y clics registrados.',
    tab: 'marketing',
    roles: ['admin', 'worker'],
    category: 'flujo',
    targetElement: '[data-tour="marketing-header"]',
  },
]
