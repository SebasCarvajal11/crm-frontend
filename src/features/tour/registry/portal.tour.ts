import type { CimaTourDefinition, GuidedQuestion } from '../model/types'

export const portalTour: CimaTourDefinition = {
  id: 'tour-portal',
  tab: 'portal',
  title: 'Recorrido de Mi espacio comercial',
  description: 'Revisa las propuestas que CIMA preparó para ti, acéptalas o recházalas y conversa con el equipo.',
  roles: ['client'],
  category: 'onboarding',
  steps: [
    {
      element: '[data-tour="portal-header"]',
      fallbackElement: '[data-tour="portal-root"]',
      title: 'Tu Espacio Comercial',
      description: 'Aquí ves tu plan con CIMA y cuántas propuestas tienes por decidir, cuántas aceptaste y cuántos mensajes sin leer te esperan.',
      actionHint: 'El número junto a "Mi espacio comercial" en el menú suma propuestas por decidir y mensajes sin leer.',
      side: 'bottom',
    },
    {
      element: '[data-tour="portal-proposals"]',
      switchPortalTab: 'proposals',
      fallbackElement: '[data-tour="portal-root"]',
      title: 'Mis Propuestas',
      description: 'Cada tarjeta muestra el título, el valor, el estado (Pendiente, Aceptada o Rechazada) y la fecha. Las pendientes aparecen primero.',
      actionHint: 'Abre una propuesta para ver qué incluye, su documento y los botones Aceptar propuesta o Rechazar.',
      side: 'top',
    },
    {
      element: '[data-tour="portal-tab-messages"]',
      fallbackElement: '[data-tour="portal-root"]',
      title: 'Mensajes con CIMA',
      description: 'Escríbele al equipo de CIMA cuando tengas dudas sobre una propuesta o necesites algo. Sus respuestas aparecen en esta conversación.',
      actionHint: 'Escribe tu mensaje y pulsa Enter (o el botón Enviar). Shift+Enter hace un salto de línea.',
      side: 'bottom',
    },
  ],
}

export const portalQuestions: GuidedQuestion[] = [
  {
    id: 'portal-q1',
    question: '¿Cómo acepto una propuesta?',
    answer: 'En Mi espacio comercial, pestaña Mis propuestas, abre la propuesta pendiente y pulsa "Aceptar propuesta". Puedes dejar un comentario opcional antes de confirmar. Si prefieres no aceptarla, pulsa "Rechazar" y cuéntanos el motivo.',
    tab: 'portal',
    roles: ['client'],
    category: 'flujo',
    targetElement: '[data-tour="portal-proposals"]',
    portalTab: 'proposals',
    fallbackTargetElement: '[data-tour="portal-root"]',
  },
  {
    id: 'portal-q2',
    question: '¿Cómo le escribo a CIMA?',
    answer: 'En Mi espacio comercial, abre la pestaña Mensajes con CIMA, escribe tu mensaje (máximo 4.000 caracteres) y pulsa Enter o Enviar. El equipo te responde en la misma conversación.',
    tab: 'portal',
    roles: ['client'],
    category: 'comunicacion',
    targetElement: '[data-tour="portal-messages"]',
    portalTab: 'messages',
    fallbackTargetElement: '[data-tour="portal-root"]',
  },
]
