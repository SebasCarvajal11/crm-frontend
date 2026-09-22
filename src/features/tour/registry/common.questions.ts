import type { GuidedQuestion } from '../model/types'

export const commonQuestions: GuidedQuestion[] = [
  {
    id: 'global-q1',
    question: '¿Cómo cambio el tamaño de letra o aumento el zoom?',
    answer: 'Pulsa el botón de accesibilidad circular ("A" o porcentaje) en la esquina inferior derecha para ajustar la escala visual según tu comodidad.',
    tab: 'overview',
    roles: ['admin', 'worker', 'client'],
    category: 'configuracion',
    targetElement: '[data-tour="accessibility-zoom"]',
  },
  {
    id: 'global-q2',
    question: '¿Cómo puedo cerrar mi sesión de forma segura?',
    answer: 'En la parte inferior del menú lateral (o en el menú de usuario), haz clic en tu nombre y selecciona "Cerrar Sesión".',
    tab: 'overview',
    roles: ['admin', 'worker', 'client'],
    category: 'configuracion',
    targetElement: '[data-tour="sidebar-footer"]',
  },
  {
    id: 'global-q3',
    question: '¿Cómo navego entre las diferentes secciones del sistema?',
    answer: 'Utiliza la barra de navegación lateral fija a la izquierda (o el menú superior en móviles) para alternar entre pestañas.',
    tab: 'overview',
    roles: ['admin', 'worker', 'client'],
    category: 'flujo',
    targetElement: '[data-tour="sidebar-nav"]',
  },
]
