import type { ProjectChatMessage } from '@/features/collab/model'
import type { MarketingMessage, MessageThread } from '../api/messages-api'
import type { ClientProposal, ProposalDecision } from '../api/portal-api'

// ── Límites del backend (crm-marketing B4) ──────────────────────────────────
export const DECISION_COMMENT_MAX = 1000
export const MESSAGE_BODY_MAX = 4000
/** Los mensajes se vuelven a pedir cada 20 s mientras la conversación está abierta. */
export const MESSAGES_REFETCH_MS = 20_000
export const CIMA_AUTHOR_NAME = 'Equipo CIMA'

// ── Errores HTTP ────────────────────────────────────────────────────────────
export function httpStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null
  const status = (error as { response?: { status?: number } }).response?.status
  return typeof status === 'number' ? status : null
}

/** 404 en /me/*: el usuario cliente aún no existe como cliente de marketing. */
export const isNotSyncedError = (error: unknown) => httpStatus(error) === 404
/** 409: la propuesta ya no está pendiente (otra persona la decidió o CIMA la cambió). */
export const isConflictError = (error: unknown) => httpStatus(error) === 409
/** 429: el cliente superó los 30 mensajes por hora. */
export const isRateLimitError = (error: unknown) => httpStatus(error) === 429

export const RATE_LIMIT_MESSAGE =
  'Has enviado muchos mensajes en poco tiempo. Espera unos minutos y vuelve a intentarlo.'

export function sendErrorMessage(error: unknown): string {
  if (isRateLimitError(error)) return RATE_LIMIT_MESSAGE
  if (httpStatus(error) === 400) return 'El mensaje no es válido: revisa que no esté vacío ni sea demasiado largo.'
  return 'No se pudo enviar el mensaje. Revisa tu conexión e inténtalo de nuevo.'
}

// ── Fechas ──────────────────────────────────────────────────────────────────
/** Las fechas sin hora ("2026-10-10") se leen como día local, no como medianoche UTC. */
export function parseDate(value?: string | null): Date | null {
  if (!value) return null
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatPortalDate(value?: string | null): string {
  const d = parseDate(value)
  return d ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(d) : '—'
}

/** Hora si es de hoy; si no, "15 oct". */
export function formatThreadTime(value?: string | null, now: Date = new Date()): string {
  const d = parseDate(value)
  if (!d) return ''
  const sameDay =
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  if (sameDay) return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(d).replace('.', '')
}

// ── Propuestas en el portal ─────────────────────────────────────────────────
export type ClientProposalState = 'pending' | 'accepted' | 'rejected' | 'other'

export function clientProposalState(status?: string | null): ClientProposalState {
  if (status === 'Sent' || status === 'In_negotiation') return 'pending'
  if (status === 'Approved') return 'accepted'
  if (status === 'Rejected') return 'rejected'
  return 'other'
}

export const CLIENT_PROPOSAL_STATE_META: Record<ClientProposalState, { label: string; chip: string }> = {
  pending: {
    label: 'Pendiente',
    chip: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  accepted: {
    label: 'Aceptada',
    chip: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  rejected: {
    label: 'Rechazada',
    chip: 'border-destructive/40 bg-destructive/10 text-destructive',
  },
  other: { label: 'En preparación', chip: 'border-border bg-muted text-muted-foreground' },
}

/** Pendientes primero; luego las más recientes. */
export function sortClientProposals(list: ClientProposal[]): ClientProposal[] {
  return [...list].sort((a, b) => {
    const pa = clientProposalState(a.status) === 'pending' ? 0 : 1
    const pb = clientProposalState(b.status) === 'pending' ? 0 : 1
    if (pa !== pb) return pa - pb
    return (parseDate(b.createdDate)?.getTime() ?? 0) - (parseDate(a.createdDate)?.getTime() ?? 0)
  })
}

/** Valida el comentario de la decisión: opcional al aceptar, obligatorio al rechazar. */
export function validateDecisionComment(decision: ProposalDecision, comment: string): string | null {
  const text = comment.trim()
  if (decision === 'REJECTED' && !text) return 'Cuéntanos por qué rechazas la propuesta: el comentario es obligatorio.'
  if (comment.length > DECISION_COMMENT_MAX) return `El comentario admite máximo ${DECISION_COMMENT_MAX} caracteres.`
  return null
}

/**
 * Nota de la decisión del cliente para las tarjetas de propuestas de CIMA:
 * "Aceptada por el cliente el 16 oct 2026" o "Rechazada: <comentario>".
 */
export function clientDecisionNote(proposal: {
  status?: string | null
  clientComment?: string | null
  decidedAt?: string | null
}): { tone: 'accepted' | 'rejected'; title: string; comment: string | null } | null {
  const comment = proposal.clientComment?.trim() || null
  if (!proposal.decidedAt && !comment) return null
  const when = proposal.decidedAt ? ` el ${formatPortalDate(proposal.decidedAt)}` : ''
  if (proposal.status === 'Rejected') {
    return { tone: 'rejected', title: `Rechazada por el cliente${when}`, comment }
  }
  if (proposal.status === 'Approved') {
    return { tone: 'accepted', title: `Aceptada por el cliente${when}`, comment }
  }
  return null
}

// ── Mensajes → burbujas del chat ────────────────────────────────────────────
export type ConversationPerspective = 'client' | 'staff'

export interface BubbleItem {
  message: ProjectChatMessage
  isOwn: boolean
  displayName: string
  authorTag: string
  authorRole: 'admin' | 'client' | null
  sameAuthorAsPrevious: boolean
  sameAuthorAsNext: boolean
  /** Etiqueta del separador de día antes de este mensaje (null si es el mismo día que el anterior). */
  daySeparator: string | null
}

const isFromCima = (m: MarketingMessage) => m.direction === 'OUTBOUND'

/**
 * Adapta un mensaje de marketing al formato de las burbujas del chat de
 * proyectos, sin mezclar datos ni API: solo se reutiliza la presentación.
 */
export function toChatMessage(m: MarketingMessage, clientName?: string | null): ProjectChatMessage {
  const fromCima = isFromCima(m)
  const author = m.authorName?.trim() || (fromCima ? CIMA_AUTHOR_NAME : clientName?.trim() || 'Cliente')
  return {
    id: m.messageId,
    projectId: 'marketing',
    channel: 'external',
    messageType: 'text',
    authorSub: fromCima ? 'cima' : 'client',
    authorEmail: null,
    authorFirstName: author,
    authorLastName: null,
    authorRole: fromCima ? 'admin' : 'client',
    authorProfession: null,
    body: m.body,
    mentionedSubs: null,
    metadata: null,
    createdAt: m.createdAt,
    readStatus: { isSeen: Boolean(m.readAt), requiredCount: 1, seenCount: m.readAt ? 1 : 0 },
  }
}

function dayKey(value: string): string {
  const d = parseDate(value)
  return d ? `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` : value
}

export function dayLabel(value: string, now: Date = new Date()): string {
  const d = parseDate(value)
  if (!d) return ''
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const that = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = Math.round((today.getTime() - that.getTime()) / 86_400_000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  return new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
}

/** Burbujas con agrupación por autor y separadores de día; cliente o CIMA a la derecha según quién mira. */
export function buildBubbles(
  messages: MarketingMessage[] | null | undefined,
  perspective: ConversationPerspective,
  clientName?: string | null,
  now: Date = new Date()
): BubbleItem[] {
  const list = Array.isArray(messages) ? messages : []
  return list.map((m, i) => {
    const prev = list[i - 1]
    const next = list[i + 1]
    const fromCima = isFromCima(m)
    const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt)
    const nextNewDay = !next || dayKey(next.createdAt) !== dayKey(m.createdAt)
    const chat = toChatMessage(m, clientName)
    return {
      message: chat,
      isOwn: perspective === 'client' ? !fromCima : fromCima,
      displayName: chat.authorFirstName ?? '',
      authorTag: fromCima ? 'CIMA' : 'Cliente',
      authorRole: fromCima ? 'admin' : 'client',
      sameAuthorAsPrevious: !newDay && !!prev && isFromCima(prev) === fromCima,
      sameAuthorAsNext: !nextNewDay && !!next && isFromCima(next) === fromCima,
      daySeparator: newDay ? dayLabel(m.createdAt, now) : null,
    }
  })
}

/** Enter envía; Shift+Enter hace salto de línea; nunca durante la composición (IME). */
export function shouldSendOnEnter(e: { key: string; shiftKey: boolean; nativeEvent?: { isComposing?: boolean } }) {
  return e.key === 'Enter' && !e.shiftKey && !e.nativeEvent?.isComposing
}

export function canSendMessage(body: string): boolean {
  const text = body.trim()
  return text.length > 0 && body.length <= MESSAGE_BODY_MAX
}

// ── Bandeja de CIMA ─────────────────────────────────────────────────────────
export function totalUnread(threads: MessageThread[] | null | undefined): number {
  return (Array.isArray(threads) ? threads : []).reduce((sum, t) => sum + Math.max(0, t.unread || 0), 0)
}

/** Sin leer primero; luego por último mensaje (más reciente arriba). */
export function sortThreads(threads: MessageThread[] | null | undefined): MessageThread[] {
  return [...(Array.isArray(threads) ? threads : [])].sort((a, b) => {
    const ua = a.unread > 0 ? 0 : 1
    const ub = b.unread > 0 ? 0 : 1
    if (ua !== ub) return ua - ub
    return (parseDate(b.lastAt)?.getTime() ?? 0) - (parseDate(a.lastAt)?.getTime() ?? 0)
  })
}

export function unansweredThreads(threads: MessageThread[] | null | undefined): MessageThread[] {
  return sortThreads(threads).filter((t) => t.unread > 0)
}

export function lastMessagePreview(thread: MessageThread): string {
  const text = thread.lastMessage?.trim()
  if (!text) return 'Sin mensajes todavía'
  return thread.lastDirection === 'OUTBOUND' ? `Tú: ${text}` : text
}
