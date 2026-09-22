import type { CimaTourDefinition, GuidedQuestion } from '../model/types'

export const analyticsTour: CimaTourDefinition = {
  id: 'tour-analytics',
  tab: 'analytics',
  title: 'Recorrido de la Pestaña Analítica',
  description: 'Explora gráficos de rendimiento, volumen de tareas resueltas y tiempos de entrega.',
  roles: ['admin', 'worker'],
  steps: [
    {
      element: '[data-tour="analytics-header"]',
      title: 'Panel de Rendimiento Analítico',
      description: 'Monitorea el desempeño general de proyectos y tiempos de resolución.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="analytics-charts"]',
      title: 'Gráficos Comparativos',
      description: 'Visualiza la evolución temporal de proyectos concluidos y carga por colaborador.',
      side: 'top',
      align: 'center',
      showPointer: true,
    },
  ],
}

export const analyticsQuestions: GuidedQuestion[] = [
  {
    id: 'an-q1',
    question: '¿Qué información puedo consultar en Analítica?',
    answer: 'Visualiza tasas de culminación de proyectos, distribución de tareas por estado y cumplimiento de entregables.',
    tab: 'analytics',
    roles: ['admin', 'worker'],
    category: 'flujo',
    tourId: 'tour-analytics',
  },
]
