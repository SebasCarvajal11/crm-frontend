import type { CimaTourDefinition, GuidedQuestion } from '../model/types'

export const accountTour: CimaTourDefinition = {
  id: 'tour-account',
  tab: 'account',
  title: 'Recorrido de Mi Cuenta',
  description: 'Gestiona tus datos de acceso, foto de perfil, contraseña y sesiones activas.',
  roles: ['admin', 'worker', 'client'],
  steps: [
    {
      element: '[data-tour="account-hero"]',
      title: 'Tu Perfil y Foto',
      description: 'Aquí puedes actualizar tu nombre visible y cargar o recortar tu fotografía de perfil.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="account-security"]',
      title: 'Seguridad y Contraseña',
      description: 'Cambia tu contraseña periódicamente para proteger tu acceso a la plataforma.',
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
]
