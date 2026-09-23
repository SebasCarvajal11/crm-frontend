import type { CimaTourDefinition } from '../model/types'
export { adminQuestions } from './admin.questions'

export const adminTour: CimaTourDefinition = {
  id: 'tour-admin',
  tab: 'admin',
  title: 'Recorrido de la Consola de Administracion',
  description:
    'Guia completa para la gobernanza de usuarios, control de cuotas de almacenamiento y centro de incorporacion.',
  roles: ['admin'],
  steps: [
    {
      element: '[data-tour="admin-header"]',
      title: 'Consola de Administracion y Gobernanza',
      description:
        'Panel central para el gobierno de usuarios, control de cuotas en la nube y asignacion de privilegios.',
      actionHint: 'Acceso restringido exclusivamente a miembros con rol de administrador.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-kpis"]',
      title: 'Indicadores Ejecutivos de Comunidad',
      description:
        'Supervisa en tiempo real el total de cuentas, el equipo interno (admins y trabajadores), clientes y usuarios archivados.',
      actionHint: 'Permite monitorear el crecimiento y la composicion global de los accesos.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-storage-overview"]',
      title: 'Almacenamiento de Archivos en Nube',
      description:
        'Controla el porcentaje de cuota consumido, los gigabytes ocupados y el saldo disponible para proyectos y entregables.',
      actionHint: 'Facilita la prevencion de limites de almacenamiento antes de subir archivos.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-storage-server-disk"]',
      fallbackElement: '[data-tour="admin-storage-overview"]',
      title: 'Estado del Disco del Servidor',
      description:
        'Monitorea el espacio del disco local donde operan la base de datos y los microservicios internos de la empresa.',
      actionHint: 'Asegura la salud y continuidad tecnica de la infraestructura operativa.',
      side: 'top',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-file-summary"]',
      title: 'Resumen de Activos Multimedia',
      description:
        'Metricas globales sobre la cantidad total de archivos, clientes con proyectos activos y peso acumulado.',
      actionHint: 'Ofrece una radiografia inmediata del uso de espacio por cliente.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-file-search"]',
      title: 'Buscador de Clientes y Proyectos',
      description:
        'Localiza rapidamente cualquier cliente, proyecto o archivo especifico ingresando su nombre o termino clave.',
      actionHint: 'Filtra el arbol de almacenamiento de manera instantanea mientras escribes.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-file-client-tree"]',
      title: 'Estructura Jerarquica de Archivos',
      description:
        'Navega entre clientes y despliega sus proyectos para consultar la cantidad y el peso de los documentos subidos.',
      actionHint: 'Haz clic en cualquier cliente o proyecto para cargar su detalle de archivos.',
      side: 'right',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-file-project-header"]',
      fallbackElement: '[data-tour="admin-file-client-tree"]',
      title: 'Gestion Masiva y Descarga ZIP',
      description:
        'Descarga todos los documentos del proyecto en un unico archivo comprimido ZIP o depura el proyecto por completo.',
      actionHint: 'El vaciado masivo libera cuota pero exige confirmacion explicita de seguridad.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-file-folder-tabs"]',
      fallbackElement: '[data-tour="admin-file-client-tree"]',
      title: 'Segmentacion por Categorias',
      description:
        'Filtra los archivos segun su carpeta funcional: briefs, contratos legales, solicitudes de cambio o entregables.',
      actionHint: 'Permite auditar rapidamente documentos especificos sin mezclar tipos.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-file-table"]',
      fallbackElement: '[data-tour="admin-file-client-tree"]',
      title: 'Explorador de Archivos y Purga',
      description:
        'Visualiza cada archivo con su peso, formato y fecha. Permite descargarlo individualmente o purgarlo de la nube.',
      actionHint: 'Selecciona varias casillas para descargar lotes especificos en paquete ZIP.',
      side: 'top',
      align: 'center',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-user-toolbar"]',
      title: 'Directorio de Usuarios y Filtros',
      description:
        'Busca cuentas por nombre o correo, filtra por rol (Admin, Trabajador, Cliente) o activa la visualizacion de archivados.',
      actionHint: 'Ajusta el tamano de pagina a 8, 12 o 20 registros segun tu preferencia.',
      side: 'bottom',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-user-table"]',
      title: 'Listado de Cuentas y Estado de Acceso',
      description:
        'Supervisa la identidad del usuario, su rol y su estado actual: Activo, Inactivo o Archivado.',
      actionHint: 'Utiliza virtualizacion de alto rendimiento para soportar cientos de registros fluidamente.',
      side: 'top',
      align: 'center',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-user-actions"]',
      fallbackElement: '[data-tour="admin-user-table"]',
      title: 'Acciones de Gobernanza de Acceso',
      description:
        'Activa o desactiva usuarios con un clic, o pulsa el icono de papelera para archivar una cuenta que causo baja.',
      actionHint: 'Los usuarios archivados se pueden restaurar en cualquier momento sin perder datos.',
      side: 'left',
      align: 'center',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-invites-section"]',
      title: 'Centro de Incorporacion de Miembros',
      description:
        'Espacio disenado para el enrolamiento ordenado de nuevos participantes bajo el principio de menor privilegio.',
      actionHint: 'Selecciona el formulario correspondiente segun el perfil y las tareas requeridas.',
      side: 'top',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-invite-client"]',
      fallbackElement: '[data-tour="admin-invites-section"]',
      title: 'Invitar un Nuevo Cliente',
      description:
        'Envia una invitacion para personas naturales o empresas con acceso al portal de colaboracion y aprobaciones.',
      actionHint: 'El cliente podra revisar contratos, briefs y solicitudes de cambio.',
      side: 'top',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-invite-worker"]',
      fallbackElement: '[data-tour="admin-invites-section"]',
      title: 'Registrar Colaborador Interno',
      description:
        'Crea cuentas operativas asignando la profesion del trabajador para su participacion en tableros Kanban y proyectos.',
      actionHint: 'Permite delegar responsabilidades tecnicas y operativas en los proyectos.',
      side: 'top',
      align: 'start',
      showPointer: true,
    },
    {
      element: '[data-tour="admin-invite-admin"]',
      fallbackElement: '[data-tour="admin-invites-section"]',
      title: 'Otorgar Privilegios de Administrador',
      description:
        'Incorpora administradores ejecutivos con control absoluto sobre la plataforma, cuotas de almacenamiento y usuarios.',
      actionHint: 'Asigna este rol unicamente a personal de absoluta confianza y direccion ejecutiva.',
      side: 'top',
      align: 'start',
      showPointer: true,
    },
  ],
}
