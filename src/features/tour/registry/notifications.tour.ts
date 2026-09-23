import type { CimaTourDefinition, GuidedQuestion } from '../model/types'

export const notificationsTour: CimaTourDefinition = {
  id: 'tour-notifications',
  tab: 'notifications',
  title: 'Recorrido del Centro de Notificaciones',
  description: 'Aprende a consultar menciones, cambios de estado y avisos importantes de tus proyectos.',
  roles: ['admin', 'worker', 'client'],
  steps: [
    {
      element: '[data-tour="notifications-header"]',
      title: 'Bandeja de Novedades',
      description: 'Encabezado principal para supervisar la actividad en tiempo real, menciones en chats y cambios.',
      actionHint: 'Mantente al día con todas las comunicaciones pendientes de tus proyectos.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="notifications-refresh-btn"]',
      title: 'Actualizar Notificaciones',
      description: 'Permite sincronizar de inmediato la bandeja con el servidor sin tener que recargar la página.',
      actionHint: 'Haz clic aquí en cualquier momento para forzar una comprobación de novedades.',
      side: 'bottom',
      align: 'end',
      showPointer: true,
    },
    {
      element: '[data-tour="notifications-list"]',
      title: 'Listado Cronológico de Avisos',
      description: 'Cada tarjeta detalla el proyecto, fecha, título del aviso y si proviene de una mención o evento interno.',
      actionHint: 'Pulsa directamente sobre cualquier notificación para saltar al proyecto correspondiente.',
      side: 'top',
      align: 'start',
      showPointer: true,
    },
  ],
}

export const notificationsQuestions: GuidedQuestion[] = [
  {
    id: 'notif-q1',
    question: '¿Cómo voy al mensaje o tarea de una notificación?',
    answer: 'Haz clic sobre cualquier notificación del listado para navegar automáticamente al proyecto y canal correspondiente.',
    tab: 'notifications',
    roles: ['admin', 'worker', 'client'],
    category: 'flujo',
    targetElement: '[data-tour="notifications-list"]',
  },
  {
    id: 'notif-q2',
    question: '¿Cómo actualizo la lista de notificaciones?',
    answer: 'En el encabezado superior, pulsa el botón "Actualizar" para sincronizar tus avisos en tiempo real.',
    tab: 'notifications',
    roles: ['admin', 'worker', 'client'],
    category: 'gestion',
    targetElement: '[data-tour="notifications-refresh-btn"]',
  },
]
