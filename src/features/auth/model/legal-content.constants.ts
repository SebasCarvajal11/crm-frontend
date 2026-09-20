export const TERMS_VERSION = '2026-v1' as const
export const TERMS_LAST_UPDATED = 'Septiembre 2026' as const

export interface LegalSection {
  id: string
  title: string
  content: string[]
}

export const TERMS_AND_CONDITIONS: LegalSection[] = [
  {
    id: 'objeto',
    title: '1. Objeto y Alcance de la Plataforma',
    content: [
      'CIMA CRM es un entorno empresarial privado desarrollado para el Centro de Innovación Multimedia y Artística (CIMA), destinado a la gestión integral de proyectos creativos, campañas de mercadeo, tableros colaborativos, propuestas comerciales y transferencia segura de entregables digitales.',
      'El acceso a este sistema está estrictamente reservado a usuarios autorizados e invitados de manera explícita (administradores, colaboradores internos y clientes vinculados). Queda prohibido el uso no autorizado o con fines ajenos a la relación comercial u operativa con CIMA.',
    ],
  },
  {
    id: 'roles',
    title: '2. Perfiles de Usuario y Responsabilidades',
    content: [
      'Administrador: Custodio de la gobernanza de la plataforma, control de roles, cuotas de almacenamiento y ciclo de vida de los accesos corporativos.',
      'Colaborador / Trabajador: Responsable de la ejecución diligente de tareas, registro verídico de entregables y cumplimiento estricto del deber de confidencialidad comercial y operativa.',
      'Cliente (Natural o Jurídico): Titular de los derechos de revisión y aprobación de propuestas, descarga de entregables finales y custodia exclusiva de sus credenciales individuales de acceso.',
    ],
  },
  {
    id: 'propiedad',
    title: '3. Propiedad Intelectual y Activos Multimedia',
    content: [
      'Los entregables, piezas audiovisuales, diseños y documentos aprobados y liquidados contractualmente se rigen bajo los acuerdos particulares de cesión o licenciamiento suscritos con cada cliente.',
      'El software CIMA CRM, su código fuente, arquitectura, diseño gráfico corporativo, logotipos y componentes de interfaz constituyen propiedad intelectual exclusiva de CIMA y están protegidos por las leyes colombianas e internacionales de derechos de autor.',
    ],
  },
  {
    id: 'uso-aceptable',
    title: '4. Política de Uso Aceptable y Prohibiciones',
    content: [
      'El usuario se compromete a no cargar ni transmitir archivos que contengan virus, troyanos o código malicioso, ni material que vulnere derechos de terceros o normativas vigentes.',
      'CIMA se reserva el derecho de revocar credenciales y suspender el acceso de inmediato ante sospechas fundadas de uso indebido o vulneración de seguridad.',
    ],
  },
]

export const PRIVACY_POLICY: LegalSection[] = [
  {
    id: 'responsable',
    title: '1. Responsable del Tratamiento de Datos',
    content: [
      'Centro de Innovación Multimedia y Artística (CIMA), con domicilio principal en Colombia, es el responsable del tratamiento y protección de los datos personales suministrados en la plataforma.',
      'Contacto oficial para ejercicio de derechos de Habeas Data: privacidad@cima.dev.',
    ],
  },
  {
    id: 'datos-recolectados',
    title: '2. Datos Recolectados y Finalidad (Ley 1581 de 2012)',
    content: [
      'En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia, se recolectan y almacenan datos de identificación (nombres, empresa, cargo), datos de contacto (correo electrónico institucional) y registros técnicos de auditoría (dirección IP, agente de usuario, marcas de tiempo de acceso).',
      'Finalidades: (a) Autenticación segura y emisión de credenciales de acceso; (b) Gestión de proyectos, tareas y tableros; (c) Notificaciones operativas del sistema; (d) Trazabilidad probatoria y auditoría de seguridad informática.',
    ],
  },
  {
    id: 'derechos-arco',
    title: '3. Derechos del Titular (Habeas Data)',
    content: [
      'Como titular de los datos, tienes derecho a: (a) Conocer, actualizar y rectificar tus datos personales; (b) Solicitar prueba de la autorización otorgada; (c) Ser informado del uso dado a tus datos; (d) Revocar la autorización o solicitar la supresión de datos cuando proceda conforme a la ley.',
      'Para ejercer cualquiera de estos derechos, puedes remitir una solicitud formal al canal institucional de privacidad de CIMA.',
    ],
  },
]

export const CLOUD_SECURITY_POLICY: LegalSection[] = [
  {
    id: 'almacenamiento-nube',
    title: '1. Infraestructura y Almacenamiento en la Nube',
    content: [
      'Los archivos, entregables y documentos de proyecto se alojan en la nube de Oracle Cloud Infrastructure (OCI Object Storage) con cifrado en tránsito (TLS 1.3) y en reposo (AES-256).',
      'La transferencia de archivos pesados se realiza directamente entre el cliente y los buckets de Oracle mediante solicitudes prefirmadas temporales (PAR), garantizando que las credenciales maestras nunca queden expuestas en el navegador.',
    ],
  },
  {
    id: 'cuarentena-antivirus',
    title: '2. Filtro Antivirus y Protocolo de Cuarentena',
    content: [
      'Todo archivo subido a la plataforma pasa por una etapa obligatoria de cuarentena y escaneo automatizado con ClamAV.',
      'Únicamente los archivos certificados como limpios y libres de amenazas son promovidos al almacenamiento definitivo de producción para su descarga o visualización.',
    ],
  },
]
