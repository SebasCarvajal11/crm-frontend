export type ParsedClause = {
  title: string
  bodyLines: string[]
  paragraphs: string[]
}

export type ParsedContract = {
  title: string
  project: string
  preamble: string
  clauses: ParsedClause[]
  additionalTerms?: string
  closingLines: string[]
  fallbackLines: string[]
}

export type ContractPreviewInput = {
  clientKind?: 'natural' | 'juridical'
  client_kind?: 'natural' | 'juridical'
  clientName?: string
  client_name?: string
  clientDocument?: string | null
  client_document?: string | null
  clientCompanyName?: string | null
  client_company_name?: string | null
  clientTaxId?: string | null
  client_tax_id?: string | null
  clientRepresentative?: string | null
  client_representative?: string | null
  clientRepresentativeDocument?: string | null
  client_representative_document?: string | null
  providerName?: string
  provider_name?: string
  providerTaxId?: string | null
  provider_tax_id?: string | null
  providerRepresentative?: string | null
  provider_representative?: string | null
  providerRepresentativeDocument?: string | null
  provider_representative_document?: string | null
  providerKind?: 'cima' | 'independent'
  provider_kind?: 'cima' | 'independent'
  planName?: string
  plan_name?: string
  serviceScope?: string
  service_scope?: string
  monthlyFee?: number
  monthly_fee?: number
  currency?: string
  taxIncluded?: boolean
  tax_included?: boolean
  termMonths?: number
  term_months?: number
  additionalTerms?: string | null
  additional_terms?: string | null
  signatureCity?: string | null
  signature_city?: string | null
}

const formatMoney = (amount: number, currency: string = 'COP') =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)

export function generateContractPreviewText(
  contract: ContractPreviewInput,
  projectName: string,
): string {
  const cKind = contract.clientKind ?? contract.client_kind ?? 'natural'
  const cName = contract.clientName ?? contract.client_name ?? ''
  const cDoc = contract.clientDocument ?? contract.client_document ?? '—'
  const cCompany = contract.clientCompanyName ?? contract.client_company_name ?? cName
  const cTaxId = contract.clientTaxId ?? contract.client_tax_id ?? '—'
  const cRep = contract.clientRepresentative ?? contract.client_representative ?? '—'
  const cRepDoc =
    contract.clientRepresentativeDocument ?? contract.client_representative_document ?? '—'

  const clientIdentity =
    cKind === 'juridical'
      ? `${cCompany}, identificada con NIT ${cTaxId}, representada legalmente por ${cRep}, identificado(a) con documento ${cRepDoc}`
      : `${cName}, documento ${cDoc}`

  const pName = contract.providerName ?? contract.provider_name ?? 'CIMA'
  const pTaxId = contract.providerTaxId ?? contract.provider_tax_id
  const pRep = contract.providerRepresentative ?? contract.provider_representative
  const pRepDoc =
    contract.providerRepresentativeDocument ?? contract.provider_representative_document

  const providerIdentity = [
    pName,
    pTaxId ? `NIT/Documento ${pTaxId}` : null,
    pRep ? `representado por ${pRep}` : null,
    pRepDoc ? `documento ${pRepDoc}` : null,
  ]
    .filter(Boolean)
    .join(', ')

  const pKind = contract.providerKind ?? contract.provider_kind ?? 'cima'
  const billingDoc = pKind === 'cima' ? 'facturas detalladas' : 'cuentas de cobro'
  const clientSigner =
    cKind === 'juridical'
      ? `Firma del representante legal: ${cRep || cName}`
      : `Firma del cliente: ${cName}`

  const planName = contract.planName ?? contract.plan_name ?? 'Plan'
  const fee = contract.monthlyFee ?? contract.monthly_fee ?? 0
  const currency = contract.currency ?? 'COP'
  const taxInc = contract.taxIncluded ?? contract.tax_included ?? true
  const termMonths = contract.termMonths ?? contract.term_months ?? 6
  const scope = contract.serviceScope ?? contract.service_scope ?? ''
  const addTerms = contract.additionalTerms ?? contract.additional_terms ?? ''
  const sigCity = contract.signatureCity ?? contract.signature_city ?? 'Bogotá, D.C.'

  return [
    'CONTRATO DE PRESTACIÓN DE SERVICIOS DE GESTIÓN DE REDES SOCIALES',
    `Proyecto: ${projectName}`,
    '',
    `Entre ${providerIdentity}, en adelante EL PRESTADOR, y ${clientIdentity}, en adelante EL CLIENTE, se celebra el presente contrato de prestación de servicios profesionales de gestión de redes sociales.`,
    '',
    'CLÁUSULA PRIMERA. OBJETO.',
    `EL PRESTADOR se compromete a proporcionar servicios profesionales de administración de redes sociales para el proyecto ${projectName}. El servicio corresponde al plan ${planName} e incluye: ${scope}`,
    'PARÁGRAFO PRIMERO. EL CLIENTE proporcionará oportunamente los medios, insumos, accesos, imágenes, logotipos, autorizaciones y demás materiales necesarios para producir y publicar los entregables acordados.',
    '',
    'CLÁUSULA SEGUNDA. CONTRAPRESTACIÓN Y FORMA DE PAGO.',
    `EL CLIENTE pagará a EL PRESTADOR la suma mensual de ${formatMoney(fee, currency)} por los servicios del plan ${planName}. El pago se realiza por mes anticipado.${taxInc ? ' El valor mensual incluye los impuestos aplicables.' : ' El valor no incluye IVA.'}`,
    `EL PRESTADOR emitirá ${billingDoc} por los servicios prestados. Las condiciones sobre anticipos, cancelaciones o devoluciones se regirán por los acuerdos comerciales y las normas aplicables.`,
    '',
    'CLÁUSULA TERCERA. DURACIÓN.',
    `El contrato tendrá una duración de ${termMonths} mes${termMonths === 1 ? '' : 'es'}, contada desde la fecha de su firma electrónica. Las partes podrán revisar, renovar o modificar sus términos por escrito al finalizar el período.`,
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
    addTerms.trim() ? `\nCondiciones adicionales\n${addTerms.trim()}` : '',
    '',
    `En aceptación de lo anterior, ${clientSigner}. El contrato se firma electrónicamente en ${sigCity}.`,
    'Al firmar electrónicamente, EL CLIENTE declara que leyó, comprendió y acepta íntegramente este documento.',
  ]
    .filter(Boolean)
    .join('\n')
}

const isClauseHeader = (line: string): boolean =>
  line.startsWith('CLÁUSULA ') || line.startsWith('CLAUSULA ')

const isParagraphHeader = (line: string): boolean =>
  line.startsWith('PARÁGRAFO ') || line.startsWith('PARAGRAFO ')

const isClosingLine = (line: string): boolean =>
  line.startsWith('En aceptación') ||
  line.startsWith('En aceptacion') ||
  line.startsWith('Al firmar')

/**
 * Parsea el snapshot textual plano del contrato en una estructura semántica
 * para facilitar su lectura jerárquica y enriquecimiento visual.
 */
export function parseContractDocument(rawText: string): ParsedContract {
  const result: ParsedContract = {
    title: '',
    project: '',
    preamble: '',
    clauses: [],
    closingLines: [],
    fallbackLines: [],
  }

  if (!rawText.trim()) return result

  const lines = rawText.split('\n').map((line) => line.trim())
  let currentClause: ParsedClause | null = null
  let inAdditionalTerms = false

  for (const line of lines) {
    if (!line) continue

    if (line.startsWith('CONTRATO DE ') && !result.title) {
      result.title = line
      continue
    }

    if (line.startsWith('Proyecto:') && !result.project) {
      result.project = line.replace(/^Proyecto:\s*/, '')
      continue
    }

    if (line.includes('EL PRESTADOR') && line.includes('EL CLIENTE') && !result.preamble) {
      result.preamble = line
      continue
    }

    if (isClauseHeader(line)) {
      inAdditionalTerms = false
      currentClause = { title: line, bodyLines: [], paragraphs: [] }
      result.clauses.push(currentClause)
      continue
    }

    if (isParagraphHeader(line) && currentClause) {
      currentClause.paragraphs.push(line)
      continue
    }

    if (line.toLowerCase() === 'condiciones adicionales') {
      inAdditionalTerms = true
      currentClause = null
      continue
    }

    if (isClosingLine(line)) {
      result.closingLines.push(line)
      continue
    }

    if (inAdditionalTerms) {
      result.additionalTerms = result.additionalTerms ? `${result.additionalTerms}\n${line}` : line
      continue
    }

    if (currentClause) {
      currentClause.bodyLines.push(line)
    } else {
      result.fallbackLines.push(line)
    }
  }

  return result
}
