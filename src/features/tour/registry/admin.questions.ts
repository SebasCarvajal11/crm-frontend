import type { GuidedQuestion } from '../model/types'

export const adminQuestions: GuidedQuestion[] = [
  {
    id: 'adm-q1',
    question: 'Como invito a un nuevo cliente al sistema',
    answer:
      'Ve a la seccion Centro de Incorporacion, completa la tarjeta Invitar cliente con su correo y datos, ' +
      'y pulsa Crear invitacion. El cliente recibira un enlace seguro para activar su cuenta.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-invite-client"]',
  },
  {
    id: 'adm-q2',
    question: 'Como registro un nuevo colaborador o trabajador interno',
    answer:
      'En el Centro de Incorporacion, ubica la tarjeta Registrar trabajador. Ingresa su correo corporativo, ' +
      'nombres, apellidos y especialidad profesional, y pulsa Registrar para enrolarlo.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-invite-worker"]',
  },
  {
    id: 'adm-q3',
    question: 'Como otorgo privilegios de administrador a un nuevo usuario',
    answer:
      'En la tarjeta Invitar administrador del Centro de Incorporacion, escribe los datos del usuario. ' +
      'Este rol cuenta con autorizacion total sobre usuarios, almacenamiento y configuraciones.',
    tab: 'admin',
    roles: ['admin'],
    category: 'configuracion',
    targetElement: '[data-tour="admin-invite-admin"]',
  },
  {
    id: 'adm-q4',
    question: 'Como desactivo o reactivo una cuenta de usuario',
    answer:
      'En el Directorio de Usuarios, localiza la fila del usuario y pulsa el boton Desactivar o Activar. ' +
      'La cuenta cambiara su estado de inmediato impidiendo o habilitando el inicio de sesion.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-user-table"]',
  },
  {
    id: 'adm-q5',
    question: 'Como archivo a un usuario que ya no pertenece a la organizacion',
    answer:
      'En la fila del usuario, pulsa el boton Archivar (icono de papelera) y confirma la accion en el dialogo. ' +
      'El usuario sera dado de baja pero se preservara su historial y trazabilidad.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-user-table"]',
  },
  {
    id: 'adm-q6',
    question: 'Donde consulto y restauro usuarios archivados',
    answer:
      'En la barra de herramientas del Directorio, marca la casilla Incluir archivados. ' +
      'Los usuarios archivados mostraran una insignia roja y el boton Restaurar para reactivarlos.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-user-toolbar"]',
  },
  {
    id: 'adm-q7',
    question: 'Como filtro usuarios por su rol (Administrador, Trabajador, Cliente)',
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
    question: 'Como superviso el consumo de almacenamiento en la nube y cuota contratada',
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
    question: 'Que representa el indicador de Estado del Sistema y Servidor',
    answer:
      'Muestra la capacidad del disco duro local donde opera la base de datos y los procesos internos. ' +
      'No consume cuota de almacenamiento en la nube pero es vital para la salud del CRM.',
    tab: 'admin',
    roles: ['admin'],
    category: 'configuracion',
    targetElement: '[data-tour="admin-storage-server-disk"]',
  },
  {
    id: 'adm-q10',
    question: 'Como busco los archivos de un cliente o proyecto puntual',
    answer:
      'En el Gestor y Explorador de Archivos, usa el buscador superior para filtrar por cliente o proyecto, ' +
      'o navega directamente en el arbol jerarquico lateral haciendo clic sobre el nombre deseado.',
    tab: 'admin',
    roles: ['admin'],
    category: 'flujo',
    targetElement: '[data-tour="admin-file-search"]',
  },
  {
    id: 'adm-q11',
    question: 'Como descargo todos los archivos de un proyecto en un unico archivo ZIP',
    answer:
      'Selecciona el proyecto en el arbol jerarquico y pulsa el boton Exportar ZIP en el encabezado. ' +
      'El sistema empaquetara automaticamente todos los entregables, contratos y briefs en un archivo comprimido.',
    tab: 'admin',
    roles: ['admin'],
    category: 'flujo',
    targetElement: '[data-tour="admin-file-project-header"]',
  },
  {
    id: 'adm-q12',
    question: 'Como descargo un lote seleccionado de archivos especificos',
    answer:
      'En la tabla de archivos del proyecto, marca las casillas de los archivos que requieras y pulsa ' +
      'Descargar seleccion en la barra inferior. Se generara un paquete ZIP solo con los elementos elegidos.',
    tab: 'admin',
    roles: ['admin'],
    category: 'flujo',
    targetElement: '[data-tour="admin-file-table"]',
  },
  {
    id: 'adm-q13',
    question: 'Que significa purgar un archivo y que impacto tiene en la cuota',
    answer:
      'Purgar elimina fisicamente el archivo del proveedor de nube y libera su espacio de inmediato. ' +
      'Los documentos firmados estan protegidos y exigen confirmacion forzada adicional para evitar perdidas.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-file-table"]',
  },
  {
    id: 'adm-q14',
    question: 'Como vaciar por completo todos los archivos de un proyecto terminado',
    answer:
      'En el encabezado del proyecto, pulsa Vaciar proyecto. Se abrira un dialogo de seguridad que detalla ' +
      'los megabytes que seran liberados antes de proceder con la eliminacion masiva.',
    tab: 'admin',
    roles: ['admin'],
    category: 'gestion',
    targetElement: '[data-tour="admin-file-project-header"]',
  },
]
