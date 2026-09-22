import type { CimaTourDefinition, GuidedQuestion } from '../model/types'

export const notificationsTour: CimaTourDefinition = {
  id: 'tour-notifications',
  tab: 'notifications',
  title: 'Recorrido del Centro de Notificaciones',
  description: 'Aprende a consultar menciones, cambios de estado y avisos importantes.',
  roles: ['admin', 'worker', 'client'],
  steps: [
    {
      element: '[data-tour="notifications-header"]',
      title: 'Bandeja de Avisos',
      description: 'Revisa cronológicamente todas las notificaciones recibidas en CIMA CRM.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="notifications-mark-read"]',
      title: 'Marcar como Leídas',
      description: 'Permite limpiar los contadores de notificaciones con un solo clic.',
      side: 'bottom',
      align: 'end',
      showPointer: true,
    },
  ],
}

export const notificationsQuestions: GuidedQuestion[] = [
  {
    id: 'notif-q1',
    question: '¿Cómo voy al mensaje o tarea de una notificación?',
    answer: 'Haz clic sobre cualquier notificación para saltar directamente al proyecto o mensaje correspondiente.',
    tab: 'notifications',
    roles: ['admin', 'worker', 'client'],
    category: 'flujo',
    targetElement: '[data-tour="notifications-header"]',
  },
]
