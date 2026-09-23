import type { CimaTourDefinition, GuidedQuestion } from '../model/types'

export const accountTour: CimaTourDefinition = {
  id: 'tour-account',
  tab: 'account',
  title: 'Recorrido de Mi Cuenta',
  description: 'Gestiona tus datos de acceso, foto de perfil, sesiones abiertas y credenciales de seguridad.',
  roles: ['admin', 'worker', 'client'],
  steps: [
    {
      element: '[data-tour="account-header"]',
      title: 'Ajustes de Mi Cuenta',
      description: 'Encabezado principal donde se sintetizan las opciones de administración de tu perfil personal.',
      actionHint: 'Revisa periódicamente el estado de tu cuenta.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="account-hero"]',
      title: 'Tu Perfil y Fotografía',
      description: 'Aquí puedes actualizar tu nombre visible y cargar o recortar tu fotografía oficial de perfil.',
      actionHint: 'Haz clic en la imagen para subir una nueva foto o recortarla con fluidez.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="account-sessions"]',
      title: 'Dispositivos y Sesiones Activas',
      description: 'Supervisa los dispositivos conectados actualmente y revoca sesiones remotas sospechosas.',
      actionHint: 'Permite auditar la seguridad de tus accesos desde diferentes equipos.',
      side: 'top',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="account-security"]',
      title: 'Seguridad y Contraseña',
      description: 'Actualiza tu contraseña periódicamente para proteger tu acceso a la plataforma CIMA.',
      actionHint: 'Introduce tu clave actual y define una contraseña robusta con confirmación.',
      side: 'top',
      align: 'start',
      showPointer: true,
    },
  ],
}

export const accountQuestions: GuidedQuestion[] = [
  {
    id: 'acc-q1',
    question: '¿Cómo cambio mi contraseña de acceso?',
    answer: 'En la sección Seguridad de Mi Cuenta, escribe tu contraseña actual y define tu nueva clave.',
    tab: 'account',
    roles: ['admin', 'worker', 'client'],
    category: 'configuracion',
    targetElement: '[data-tour="account-security"]',
  },
  {
    id: 'acc-q2',
    question: '¿Dónde puedo actualizar mi foto de perfil?',
    answer: 'En la tarjeta de Perfil, haz clic sobre el botón de cámara para subir o recortar tu imagen.',
    tab: 'account',
    roles: ['admin', 'worker', 'client'],
    category: 'gestion',
    targetElement: '[data-tour="account-hero"]',
  },
  {
    id: 'acc-q3',
    question: '¿Cómo cierro sesiones activas en otros dispositivos?',
    answer: 'En el panel Sesiones Activas puedes consultar la lista de equipos conectados y cerrarlas remotamente.',
    tab: 'account',
    roles: ['admin', 'worker', 'client'],
    category: 'configuracion',
    targetElement: '[data-tour="account-sessions"]',
  },
]
