import type { GuidedQuestion } from '../model/types'

export const adminQuestions: GuidedQuestion[] = [
  {
    id: 'adm-q1',
    question: '¿Cómo invito a un nuevo cliente al sistema?',
    answer:
      'Ve a la sección Centro de Incorporación, completa la tarjeta Invitar cliente con su correo y datos, ' +
      'y pulsa Crear invitación. El cliente recibirá un enlace seguro para activar su cuenta.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-invite-client"]',
    fallbackTargetElement: '[data-tour="admin-invites-section"]',
  },
  {
    id: 'adm-q2',
    question: '¿Cómo registro un nuevo colaborador o trabajador interno?',
    answer:
      'En el Centro de Incorporación, ubica la tarjeta Registrar trabajador. Ingresa su correo corporativo, ' +
      'nombres, apellidos y especialidad profesional, y pulsa Registrar para enrolarlo.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-invite-worker"]',
    fallbackTargetElement: '[data-tour="admin-invites-section"]',
  },
  {
    id: 'adm-q3',
    question: '¿Cómo otorgo privilegios de administrador a un nuevo usuario?',
    answer:
      'En la tarjeta Invitar administrador del Centro de Incorporación, escribe los datos del usuario. ' +
      'Este rol cuenta con autorización total sobre usuarios, almacenamiento y configuraciones.',
    tab: 'admin',
    roles: ['admin'],
    category: 'configuracion',
    targetElement: '[data-tour="admin-invite-admin"]',
    fallbackTargetElement: '[data-tour="admin-invites-section"]',
  },
  {
    id: 'adm-q4',
    question: '¿Cómo desactivo o reactivo una cuenta de usuario?',
    answer:
      'En el Directorio de Usuarios, localiza la fila del usuario y pulsa el botón Desactivar o Activar. ' +
      'La cuenta cambiará su estado de inmediato impidiendo o habilitando el inicio de sesión.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-user-table"]',
  },
  {
    id: 'adm-q5',
    question: '¿Cómo archivo a un usuario que ya no pertenece a la organización?',
    answer:
      'En la fila del usuario, pulsa el botón Archivar (icono de papelera) y confirma la acción en el diálogo. ' +
      'El usuario será dado de baja pero se preservará su historial y trazabilidad.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-user-table"]',
  },
  {
    id: 'adm-q6',
    question: '¿Dónde consulto y restauro usuarios archivados?',
    answer:
      'En la barra de herramientas del Directorio, marca la casilla Incluir archivados. ' +
      'Los usuarios archivados mostrarán una insignia roja y el botón Restaurar para reactivarlos.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-user-toolbar"]',
  },
  {
    id: 'adm-q7',
    question: '¿Cómo filtro usuarios por su rol (Administrador, Trabajador, Cliente)?',
    answer:
      'Usa el selector Filtrar por rol en la barra superior del directorio para visualizar exclusivamente ' +
      'cuentas administradoras, colaboradores del equipo interno o clientes registrados.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-user-toolbar"]',
  },
  {
    id: 'adm-q8',
    question: '¿Cómo superviso el consumo de almacenamiento en la nube y cuota contratada?',
    answer:
      'Revisa la tarjeta Almacenamiento de Archivos en la Nube. La barra superior indica el porcentaje de uso, ' +
      'los gigabytes consumidos, el espacio disponible para nuevas subidas y el desglose por tipo de archivo.',
    tab: 'admin',
    roles: ['admin'],
    category: 'flujo',
    targetElement: '[data-tour="admin-storage-overview"]',
  },
  {
    id: 'adm-q9',
    question: '¿Qué representa el indicador de Estado del Sistema y Servidor?',
    answer:
      'Muestra la capacidad del disco duro local donde opera la base de datos y los procesos internos. ' +
      'No consume cuota de almacenamiento en la nube pero es vital para la salud del CRM.',
    tab: 'admin',
    roles: ['admin'],
    category: 'configuracion',
    targetElement: '[data-tour="admin-storage-server-disk"]',
    fallbackTargetElement: '[data-tour="admin-storage-overview"]',
  },
  {
    id: 'adm-q10',
    question: '¿Cómo busco los archivos de un cliente o proyecto puntual?',
    answer:
      'En el Gestor y Explorador de Archivos, usa el buscador superior para filtrar por cliente o proyecto, ' +
      'o navega directamente en el árbol jerárquico lateral haciendo clic sobre el nombre deseado.',
    tab: 'admin',
    roles: ['admin'],
    category: 'flujo',
    targetElement: '[data-tour="admin-file-search"]',
  },
  {
    id: 'adm-q11',
    question: '¿Cómo descargo todos los archivos de un proyecto en un único archivo ZIP?',
    answer:
      'Selecciona el proyecto en el árbol jerárquico y pulsa el botón Exportar ZIP en el encabezado. ' +
      'El sistema empaquetará automáticamente todos los entregables, contratos y briefs en un archivo comprimido.',
    tab: 'admin',
    roles: ['admin'],
    category: 'flujo',
    targetElement: '[data-tour="admin-file-project-header"]',
    fallbackTargetElement: '[data-tour="admin-file-client-tree"]',
  },
  {
    id: 'adm-q12',
    question: '¿Cómo descargo un lote seleccionado de archivos específicos?',
    answer:
      'En la tabla de archivos del proyecto, marca las casillas de los archivos que requieras y pulsa ' +
      'Descargar selección en la barra inferior. Se generará un paquete ZIP solo con los elementos elegidos.',
    tab: 'admin',
    roles: ['admin'],
    category: 'flujo',
    targetElement: '[data-tour="admin-file-table"]',
    fallbackTargetElement: '[data-tour="admin-file-client-tree"]',
  },
  {
    id: 'adm-q13',
    question: '¿Qué significa purgar un archivo y qué impacto tiene en la cuota?',
    answer:
      'Purgar elimina físicamente el archivo del proveedor de nube y libera su espacio de inmediato. ' +
      'Los documentos firmados están protegidos y exigen confirmación forzada adicional para evitar pérdidas.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-file-table"]',
    fallbackTargetElement: '[data-tour="admin-file-client-tree"]',
  },
  {
    id: 'adm-q14',
    question: '¿Cómo vaciar por completo todos los archivos de un proyecto terminado?',
    answer:
      'En el encabezado del proyecto, pulsa Vaciar proyecto. Se abrirá un diálogo de seguridad que detalla ' +
      'los megabytes que serán liberados antes de proceder con la eliminación masiva.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-file-project-header"]',
    fallbackTargetElement: '[data-tour="admin-file-client-tree"]',
  },
]
