import { sha256PureHex } from './sha256-pure'
import { listExternalChatRequest, listInternalChatRequest } from '../api/collab-api.chat'
import type { ProjectChatMessage, ProjectMember } from '../model'
import type { ChatExportChannel, ChatExportOptions, ChatExportPayload } from './chat-export.types'

const PAGE_SIZE = 100

export async function calculateSha256Hex(content: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto?.subtle?.digest) {
      const encoder = new TextEncoder()
      const data = encoder.encode(content)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    }
  } catch {
    // Entorno no seguro (HTTP) o sin SubtleCrypto: delegar en fallback matemático puro.
  }
  return sha256PureHex(content)
}

export async function fetchFullChatChannelMessages(
  accessToken: string,
  projectId: string,
  channel: 'external' | 'internal'
): Promise<ProjectChatMessage[]> {
  const fetcher = channel === 'external' ? listExternalChatRequest : listInternalChatRequest
  const firstPage = await fetcher(accessToken, projectId, { page: 1, limit: PAGE_SIZE })
  const items = [...(firstPage.data.items ?? [])]
  const total = firstPage.data.total ?? items.length
  const totalPages = Math.ceil(total / PAGE_SIZE)

  for (let page = 2; page <= totalPages; page++) {
    const nextPage = await fetcher(accessToken, projectId, { page, limit: PAGE_SIZE })
    items.push(...(nextPage.data.items ?? []))
  }

  return items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export async function fetchAllExportMessages(
  accessToken: string,
  projectId: string,
  channel: ChatExportChannel
): Promise<ProjectChatMessage[]> {
  if (channel === 'both') {
    const [ext, int] = await Promise.all([
      fetchFullChatChannelMessages(accessToken, projectId, 'external'),
      fetchFullChatChannelMessages(accessToken, projectId, 'internal'),
    ])
    return [...ext, ...int].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }
  return fetchFullChatChannelMessages(accessToken, projectId, channel)
}

export function buildExportPayload(
  options: ChatExportOptions,
  messages: ProjectChatMessage[]
): ChatExportPayload {
  const fullName = `${options.issuer.first_name ?? ''} ${options.issuer.last_name ?? ''}`.trim()
  const issuerName = fullName || options.issuer.email
  return {
    projectId: options.projectId,
    projectName: options.projectName,
    channel: options.channel,
    exportedAt: new Date().toISOString(),
    issuer: {
      userSub: options.issuer.id,
      email: options.issuer.email,
      fullName: issuerName,
      role: options.issuer.role,
    },
    participants: options.members.map((m) => ({
      userSub: m.userSub,
      fullName: `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim() || m.email || m.userSub,
      email: m.email ?? null,
      role: m.role,
    })),
    messagesCount: messages.length,
    messages,
  }
}

function formatMessageLine(msg: ProjectChatMessage, memberMap: Map<string, ProjectMember>): string {
  const date = new Date(msg.createdAt)
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
  const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`

  const member = msg.authorSub ? memberMap.get(msg.authorSub) : null
  const authorName = member
    ? `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim() || member.email
    : `${msg.authorFirstName ?? ''} ${msg.authorLastName ?? ''}`.trim() || msg.authorEmail || 'Sistema'
  const authorRole = member?.role ?? msg.authorRole ?? 'sistema'
  const channelTag = msg.channel === 'internal' ? ' [Equipo]' : ''

  const readerLabels = msg.readStatus?.reads
    ?.map((r) => (r.firstName ? `${r.firstName} ${r.lastName ?? ''}`.trim() : r.userSub))
    .join(', ')
  const readReceipts = readerLabels ? `\n  [Leído por: ${readerLabels}]` : ''

  return `[${dateStr}, ${timeStr}] ${authorName} (${authorRole})${channelTag}: ${msg.body}${readReceipts}`
}

export async function buildWhatsAppForensicTranscript(
  payload: ChatExportPayload,
  members: ProjectMember[]
): Promise<{ content: string; hash: string }> {
  const memberMap = new Map(members.map((m) => [m.userSub, m]))
  const channelLabel =
    payload.channel === 'external'
      ? 'Cliente (Externo)'
      : payload.channel === 'internal'
        ? 'Equipo (Interno)'
        : 'Ambos Canales'

  const lines: string[] = [
    '================================================================================',
    '           CIMA CRM — REGISTRO PROBATORIO OFICIAL DE CONVERSACIÓN',
    '           Cadena de Custodia y Trazabilidad de Comunicaciones Digitales',
    '================================================================================',
    `Proyecto: ${payload.projectName || 'Sin título'}`,
    `ID del Proyecto: ${payload.projectId}`,
    `Canal de Comunicación: ${channelLabel}`,
    `Fecha y Hora de Emisión: ${payload.exportedAt}`,
    `Custodio Responsable: ${payload.issuer.fullName} (${payload.issuer.role}) <${payload.issuer.email}>`,
    `ID Custodio: ${payload.issuer.userSub}`,
    `Total de Mensajes Registrados: ${payload.messagesCount}`,
    'Estándar Normativo: Ley 527 de 1999 (Mensajes de Datos) / ISO/IEC 27037:2012',
    '================================================================================',
    'PARTICIPANTES EN EL PROYECTO:',
    ...payload.participants.map((p) => `- ${p.fullName} (${p.role}) ${p.email ? `<${p.email}>` : ''}`),
    '================================================================================',
    'TRANSCRIPCIÓN CRONOLÓGICA DE MENSAJES:',
    '--------------------------------------------------------------------------------',
    ...payload.messages.map((m) => formatMessageLine(m, memberMap)),
    '--------------------------------------------------------------------------------',
    '================================================================================',
    'CERTIFICACIÓN DE INTEGRIDAD Y DISPOSICIÓN PROBATORIA:',
    'El presente documento constituye un registro inmutable emitido desde la plataforma',
    'CIMA CRM. La autenticidad e integridad del contenido se encuentran respaldadas',
    'mediante el resumen criptográfico calculado al momento de la emisión.',
  ]

  const rawContent = lines.join('\n')
  const hash = await calculateSha256Hex(rawContent)

  const finalContent = [
    rawContent,
    `Resumen Criptográfico de Integridad (SHA-256): ${hash}`,
    '================================================================================',
  ].join('\n')

  return { content: finalContent, hash }
}

export async function buildAuditJsonTranscript(
  payload: ChatExportPayload
): Promise<{ content: string; hash: string }> {
  const clone = { ...payload }
  delete clone.integritySha256
  const rawJson = JSON.stringify(clone, null, 2)
  const hash = await calculateSha256Hex(rawJson)
  clone.integritySha256 = hash
  return { content: JSON.stringify(clone, null, 2), hash }
}

export function triggerFileDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
