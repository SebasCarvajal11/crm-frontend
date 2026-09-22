import type { CimaTourDefinition, GuidedQuestion } from '../model/types'

export const overviewTour: CimaTourDefinition = {
  id: 'tour-overview',
  tab: 'overview',
  title: 'Recorrido de la Pestaña Resumen',
  description: 'Aprende a interpretar los indicadores clave y accesos directos de tu panel principal.',
  roles: ['admin', 'worker'],
  steps: [
    {
      element: '[data-tour="overview-identity"]',
      title: 'Tu Identidad y Perfil',
      description: 'Muestra tu usuario, correo electrónico, rol activo y la fecha actual de trabajo.',
      actionHint: 'Desde aquí puedes verificar tu sesión de forma rápida.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="overview-kpis"]',
      title: 'Métricas e Indicadores Clave',
      description: 'Tarjetas de resumen con el estado global de proyectos, tareas activas y rendimiento.',
      actionHint: 'Revisa estos números para evaluar el ritmo de trabajo.',
      side: 'bottom',
      align: 'center',
      showPointer: true,
    },
    {
      element: '[data-tour="overview-recent-projects"]',
      title: 'Proyectos Recientes',
      description: 'Lista directa de los últimos proyectos en los que se ha registrado actividad.',
      actionHint: 'Haz clic en cualquier proyecto para ir directo a su espacio de trabajo.',
      side: 'top',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="overview-notifications"]',
      title: 'Últimas Novedades',
      description: 'Resumen de avisos pendientes, menciones y cambios relevantes que requieren tu atención.',
      actionHint: 'Pulsa una notificación para abrir el elemento asociado.',
      side: 'top',
      align: 'end',
      showPointer: true,
    },
  ],
}

export const overviewQuestions: GuidedQuestion[] = [
  {
    id: 'ov-q1',
    question: '¿Qué información encuentro en la pestaña Resumen?',
    answer: 'En Resumen tienes una vista panorámica de métricas clave, proyectos recientes, tareas prioritarias y notificaciones recientes.',
    tab: 'overview',
    roles: ['admin', 'worker'],
    category: 'flujo',
    tourId: 'tour-overview',
  },
  {
    id: 'ov-q2',
    question: '¿Cómo accedo rápidamente a un proyecto desde aquí?',
    answer: 'En la sección de Proyectos Recientes, pulsa sobre la tarjeta del proyecto deseado para abrirlo directamente.',
    tab: 'overview',
    roles: ['admin', 'worker'],
    category: 'gestion',
    targetElement: '[data-tour="overview-recent-projects"]',
  },
  {
    id: 'ov-q3',
    question: '¿Dónde veo si tengo tareas pendientes o bloqueadas?',
    answer: 'En la zona media de la pantalla se listan las tareas bloqueadas y la carga de trabajo asignada.',
    tab: 'overview',
    roles: ['admin', 'worker'],
    category: 'gestion',
    targetElement: '[data-tour="overview-kpis"]',
  },
]
