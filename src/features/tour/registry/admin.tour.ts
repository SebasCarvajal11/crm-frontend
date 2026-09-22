import type { CimaTourDefinition, GuidedQuestion } from '../model/types'

export const adminTour: CimaTourDefinition = {
  id: 'tour-admin',
  tab: 'admin',
  title: 'Recorrido de la Consola de Administración',
  description: 'Aprende a gestionar usuarios, configurar roles de acceso y auditar la actividad del sistema.',
  roles: ['admin'],
  steps: [
    {
      element: '[data-tour="admin-users-header"]',
      title: 'Gestión de Usuarios y Roles',
      description: 'Supervisa a todos los colaboradores, clientes y administradores registrados en CIMA CRM.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-invite-btn"]',
      title: 'Invitar un Nuevo Usuario',
      description: 'Envía un enlace de registro por correo electrónico asignándole su rol correspondiente.',
      side: 'bottom',
      align: 'end',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-users-table"]',
      title: 'Directorio de Cuentas',
      description: 'Consulta el estado de cada cuenta (activa, pendiente, suspendida) y gestiona sus permisos.',
      side: 'top',
      align: 'center',
      showPointer: true,
    },
  ],
}

export const adminQuestions: GuidedQuestion[] = [
  {
    id: 'adm-q1',
    question: '¿Cómo invito a un nuevo usuario o cliente?',
    answer: 'Pulsa el botón "Invitar Usuario", escribe su correo y selecciona el rol: Administrador, Colaborador o Cliente.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-invite-btn"]',
  },
  {
    id: 'adm-q2',
    question: '¿Cómo suspendo o reactivo una cuenta de usuario?',
    answer: 'Busca el usuario en la tabla y pulsa el menú de opciones de su fila para cambiar su estado a suspendido o activo.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-users-table"]',
  },
]
