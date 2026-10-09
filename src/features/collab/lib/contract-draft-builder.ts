import type { ProjectContractDraftInput } from '@/features/collab/api'

export type ContractDraftChecklistItem = {
  id: 'provider' | 'client' | 'plan' | 'delivery'
  label: string
  done: boolean
}

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)

function getClientIdentity(c: ProjectContractDraftInput): string {
  if (c.client_kind === 'juridical') {
    const company = c.client_company_name || '[Razón social pendiente]'
    const nit = c.client_tax_id ? `NIT ${c.client_tax_id}` : '[NIT pendiente]'
    const rep = c.client_representative || '[Representante pendiente]'
    const doc = c.client_representative_document
      ? `documento ${c.client_representative_document}`
      : '[Documento pendiente]'
    return `${company}, identificada con ${nit}, representada legalmente por ${rep}, identificado(a) con ${doc}`
  }

  const name = c.client_name || '[Nombre del cliente pendiente]'
  const doc = c.client_document ? `documento ${c.client_document}` : '[Documento pendiente]'
  return `${name}, ${doc}`
}

function getProviderIdentity(c: ProjectContractDraftInput): string {
  const parts = [
    c.provider_name || '[Prestador pendiente]',
    c.provider_tax_id ? `NIT/Documento ${c.provider_tax_id}` : null,
    c.provider_representative ? `representado por ${c.provider_representative}` : null,
    c.provider_representative_document
      ? `documento ${c.provider_representative_document}`
      : null,
  ].filter(Boolean)

  return parts.join(', ')
}

export function buildDraftContractSnapshot(
  c: ProjectContractDraftInput,
  projectName: string
): string {
  const clientIdentity = getClientIdentity(c)
  const providerIdentity = getProviderIdentity(c)
  const billingDoc = c.provider_kind === 'cima' ? 'facturas detalladas' : 'cuentas de cobro'
  const repName = c.client_representative || '[Representante pendiente]'
  const clientName = c.client_name || '[Nombre pendiente]'
  const signingId =
    c.client_kind === 'juridical'
      ? `Firma del representante legal: ${repName}`
      : `Firma del cliente: ${clientName}`
  const taxNote = c.tax_included
    ? ' El valor mensual incluye los impuestos aplicables.'
    : ' El valor no incluye IVA.'
  const city = c.signature_city || '[Ciudad pendiente]'

  return [
    'CONTRATO DE PRESTACIÓN DE SERVICIOS DE GESTIÓN DE REDES SOCIALES',
    `Proyecto: ${projectName || '[Nombre de proyecto]'}`,
    '',
    `Entre ${providerIdentity}, en adelante EL PRESTADOR, y ${clientIdentity}, en adelante EL CLIENTE, se celebra el presente contrato de prestación de servicios profesionales de gestión de redes sociales.`,
    '',
    'CLÁUSULA PRIMERA. OBJETO.',
    `EL PRESTADOR se compromete a proporcionar servicios profesionales de administración de redes sociales para el proyecto ${projectName}. El servicio corresponde al plan ${c.plan_name} e incluye: ${c.service_scope || '[Alcance del servicio pendiente]'}`,
    'PARÁGRAFO PRIMERO. EL CLIENTE proporcionará oportunamente los medios, insumos, accesos, imágenes, logotipos, autorizaciones y demás materiales necesarios para producir y publicar los entregables acordados.',
    '',
    'CLÁUSULA SEGUNDA. CONTRAPRESTACIÓN Y FORMA DE PAGO.',
    `EL CLIENTE pagará a EL PRESTADOR la suma mensual de ${formatMoney(c.monthly_fee, c.currency)} por los servicios del plan ${c.plan_name}. El pago se realiza por mes anticipado.${taxNote}`,
    `EL PRESTADOR emitirá ${billingDoc} por los servicios prestados. Las condiciones sobre anticipos, cancelaciones o devoluciones se regirán por los acuerdos comerciales y las normas aplicables.`,
    '',
    'CLÁUSULA TERCERA. DURACIÓN.',
    `El contrato tendrá una duración de ${c.term_months} mes${c.term_months === 1 ? '' : 'es'}, contada desde la fecha de su firma electrónica. Las partes podrán revisar, renovar o modificar sus términos por escrito al finalizar el período.`,
    '',
    'CLÁUSULA CUARTA. CONTENIDO Y COLABORACIÓN.',
    'EL CLIENTE se compromete a proporcionar acceso oportuno y completo a la información, materiales y recursos requeridos para la ejecución de los servicios, incluyendo imágenes, logotipos y cualquier contenido necesario para publicaciones y campañas.',
    '',
    'CLÁUSULA QUINTA. PROPIEDAD INTELECTUAL.',
    'Los derechos de propiedad intelectual sobre el contenido creado y desarrollado durante la ejecución del contrato pertenecerán a EL CLIENTE, salvo pacto escrito diferente o derechos preexistentes de terceros.',
    '',
    'CLÁUSULA SEXTA. CONFIDENCIALIDAD.',
    'Las partes se obligan a conservar la confidencialidad de la información sensible, exclusiva o no pública revelada durante la ejecución de los servicios, salvo obligación legal o autorización escrita.',
    '',
    'CLÁUSULA SÉPTIMA. TERMINACIÓN.',
    'Cualquiera de las partes podrá terminar el contrato mediante notificación escrita con al menos veinte (20) días de antelación a la siguiente facturación. EL CLIENTE deberá pagar los servicios efectivamente prestados hasta la fecha de terminación.',
    c.additional_terms?.trim() ? `\nCondiciones adicionales\n${c.additional_terms.trim()}` : '',
    '',
    `En aceptación de lo anterior, ${signingId}. El contrato se firma electrónicamente en ${city}.`,
    'Al firmar electrónicamente, EL CLIENTE declara que leyó, comprendió y acepta íntegramente este documento.',
  ]
    .filter(Boolean)
    .join('\n')
}

export function getContractDraftChecklist(
  c: ProjectContractDraftInput
): ContractDraftChecklistItem[] {
  const isProviderDone = Boolean(c.provider_name && c.provider_tax_id)
  const isClientDone =
    c.client_kind === 'juridical'
      ? Boolean(
          c.client_company_name &&
            c.client_tax_id &&
            c.client_representative &&
            c.client_representative_document &&
            c.client_email
        )
      : Boolean(c.client_name && c.client_document && c.client_email)

  const isPlanDone = Boolean(c.plan_name && c.monthly_fee > 0 && c.term_months > 0)
  const isDeliveryDone = Boolean(c.service_scope?.trim() && c.signature_city?.trim())

  return [
    { id: 'provider', label: 'Prestador identificado', done: isProviderDone },
    { id: 'client', label: 'Datos fiscales y representante', done: isClientDone },
    { id: 'plan', label: 'Plan y condiciones económicas', done: isPlanDone },
    { id: 'delivery', label: 'Alcance del servicio y ciudad', done: isDeliveryDone },
  ]
}
