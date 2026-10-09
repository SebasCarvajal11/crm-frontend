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
