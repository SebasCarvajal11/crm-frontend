import { describe, expect, it } from 'vitest'
import type { MarketingMessage, MessageThread } from '../api/messages-api'
import type { ClientProposal } from '../api/portal-api'
import { interactionOrigin, channelDisplay } from './interaction-types.constants'
import { portalBadgeCount } from '../hooks/use-portal-summary'
import {
  buildBubbles,
  canSendMessage,
  clientDecisionNote,
  clientProposalState,
  formatThreadTime,
  isConflictError,
  isNotSyncedError,
  isRateLimitError,
  lastMessagePreview,
  parseDate,
  sendErrorMessage,
  shouldSendOnEnter,
  sortClientProposals,
  sortThreads,
  toChatMessage,
  totalUnread,
  unansweredThreads,
  validateDecisionComment,
  DECISION_COMMENT_MAX,
  MESSAGE_BODY_MAX,
  RATE_LIMIT_MESSAGE,
} from './portal.utils'

const err = (status: number) => ({ response: { status } })

describe('errores del portal', () => {
  it('reconoce 404 (sin sincronizar), 409 (ya decidida) y 429 (límite)', () => {
    expect(isNotSyncedError(err(404))).toBe(true)
    expect(isConflictError(err(409))).toBe(true)
    expect(isRateLimitError(err(429))).toBe(true)
    expect(isRateLimitError(err(500))).toBe(false)
    expect(isNotSyncedError(null)).toBe(false)
  })
  it('traduce el 429 a un mensaje amable', () => {
    expect(sendErrorMessage(err(429))).toBe(RATE_LIMIT_MESSAGE)
    expect(sendErrorMessage(err(500))).toMatch(/No se pudo enviar/)
  })
})

describe('propuestas del cliente', () => {
  it('Sent e In_negotiation son "pendiente"', () => {
    expect(clientProposalState('Sent')).toBe('pending')
    expect(clientProposalState('In_negotiation')).toBe('pending')
    expect(clientProposalState('Approved')).toBe('accepted')
    expect(clientProposalState('Rejected')).toBe('rejected')
    expect(clientProposalState('In_diagnosis')).toBe('other')
  })
  it('ordena pendientes primero y luego por fecha descendente', () => {
    const lista: ClientProposal[] = [
      { proposalId: 1, title: 'A', status: 'Approved', createdDate: '2026-10-20' },
      { proposalId: 2, title: 'B', status: 'Sent', createdDate: '2026-09-01' },
      { proposalId: 3, title: 'C', status: 'Rejected', createdDate: '2026-10-21' },
    ]
    expect(sortClientProposals(lista).map((p) => p.proposalId)).toEqual([2, 3, 1])
  })
  it('comentario: opcional al aceptar, obligatorio al rechazar, máximo 1000', () => {
    expect(validateDecisionComment('ACCEPTED', '')).toBeNull()
    expect(validateDecisionComment('REJECTED', '   ')).toMatch(/obligatorio/)
    expect(validateDecisionComment('REJECTED', 'Muy caro')).toBeNull()
    expect(validateDecisionComment('ACCEPTED', 'x'.repeat(DECISION_COMMENT_MAX + 1))).toMatch(/1000/)
  })
  it('lee fechas sin hora como día local', () => {
    expect(parseDate('2026-10-10')?.getDate()).toBe(10)
    expect(parseDate('basura')).toBeNull()
  })
})

describe('decisión del cliente en las tarjetas de CIMA', () => {
  it('"Aceptada por el cliente el …" y "Rechazada…" con su motivo', () => {
    const aceptada = clientDecisionNote({ status: 'Approved', decidedAt: '2026-10-16T10:00:00', clientComment: '¡Adelante!' })
    expect(aceptada?.tone).toBe('accepted')
    expect(aceptada?.title).toMatch(/^Aceptada por el cliente el /)
    expect(aceptada?.comment).toBe('¡Adelante!')
    const rechazada = clientDecisionNote({ status: 'Rejected', clientComment: 'Muy caro', decidedAt: null })
    expect(rechazada).toEqual({ tone: 'rejected', title: 'Rechazada por el cliente', comment: 'Muy caro' })
  })
  it('sin datos del portal (o campos aún no expuestos por el backend) no muestra nada', () => {
    expect(clientDecisionNote({ status: 'Approved' })).toBeNull()
    expect(clientDecisionNote({ status: 'Sent', clientComment: 'x' })).toBeNull()
  })
})

const mensajes: MarketingMessage[] = [
  { messageId: 'm1', direction: 'OUTBOUND', body: 'Hola', createdAt: '2026-10-21T09:00:00', readAt: '2026-10-21T09:05:00', authorName: 'Equipo CIMA' },
  { messageId: 'm2', direction: 'OUTBOUND', body: '¿Revisaste la propuesta?', createdAt: '2026-10-21T09:01:00', readAt: null, authorName: 'Equipo CIMA' },
  { messageId: 'm3', direction: 'INBOUND', body: 'Sí, gracias', createdAt: '2026-10-22T08:00:00', readAt: null, authorName: 'Acme SAS' },
]

describe('mensajes → burbujas', () => {
  it('adapta el mensaje al formato del chat con estado de lectura', () => {
    const chat = toChatMessage(mensajes[0])
    expect(chat).toMatchObject({ id: 'm1', body: 'Hola', authorFirstName: 'Equipo CIMA', authorRole: 'admin' })
    expect(chat.readStatus).toEqual({ isSeen: true, requiredCount: 1, seenCount: 1 })
    expect(toChatMessage(mensajes[1]).readStatus?.isSeen).toBe(false)
    expect(toChatMessage({ ...mensajes[2], authorName: null }, 'Acme').authorFirstName).toBe('Acme')
  })
  it('el cliente ve sus mensajes a la derecha; CIMA ve los suyos a la derecha', () => {
    const now = new Date(2026, 9, 22, 12)
    const cliente = buildBubbles(mensajes, 'client', 'Acme', now)
    expect(cliente.map((b) => b.isOwn)).toEqual([false, false, true])
    expect(buildBubbles(mensajes, 'staff', 'Acme', now).map((b) => b.isOwn)).toEqual([true, true, false])
  })
  it('agrupa por autor y separa por día', () => {
    const [a, b, c] = buildBubbles(mensajes, 'client', 'Acme', new Date(2026, 9, 22, 12))
    expect(a.daySeparator).toBe('Ayer')
    expect(a.sameAuthorAsNext).toBe(true)
    expect(b.sameAuthorAsPrevious).toBe(true)
    expect(b.sameAuthorAsNext).toBe(false)
    expect(c.daySeparator).toBe('Hoy')
    expect(buildBubbles(null, 'client')).toEqual([])
  })
  it('Enter envía, Shift+Enter no; no se envía vacío ni más de 4000', () => {
    expect(shouldSendOnEnter({ key: 'Enter', shiftKey: false })).toBe(true)
    expect(shouldSendOnEnter({ key: 'Enter', shiftKey: true })).toBe(false)
    expect(shouldSendOnEnter({ key: 'Enter', shiftKey: false, nativeEvent: { isComposing: true } })).toBe(false)
    expect(canSendMessage('   ')).toBe(false)
    expect(canSendMessage('x'.repeat(MESSAGE_BODY_MAX))).toBe(true)
    expect(canSendMessage('x'.repeat(MESSAGE_BODY_MAX + 1))).toBe(false)
  })
})

describe('bandeja de CIMA', () => {
  const threads: MessageThread[] = [
    { clientId: 'a', clientName: 'Acme', lastMessage: 'Hola', lastAt: '2026-10-22T08:00:00', lastDirection: 'INBOUND', unread: 0 },
    { clientId: 'b', clientName: 'Beta', lastMessage: 'Listo', lastAt: '2026-10-20T08:00:00', lastDirection: 'INBOUND', unread: 2 },
    { clientId: 'c', clientName: 'Gamma', lastMessage: 'Te escribo', lastAt: '2026-10-21T08:00:00', lastDirection: 'OUTBOUND', unread: 1 },
  ]
  it('suma los no leídos y ordena sin leer primero', () => {
    expect(totalUnread(threads)).toBe(3)
    expect(totalUnread(undefined)).toBe(0)
    expect(sortThreads(threads).map((t) => t.clientId)).toEqual(['c', 'b', 'a'])
    expect(unansweredThreads(threads).map((t) => t.clientId)).toEqual(['c', 'b'])
  })
  it('vista previa con "Tú:" en los mensajes de CIMA y hora o fecha corta', () => {
    expect(lastMessagePreview(threads[2])).toBe('Tú: Te escribo')
    expect(lastMessagePreview({ ...threads[0], lastMessage: null })).toBe('Sin mensajes todavía')
    const now = new Date(2026, 9, 22, 12)
    expect(formatThreadTime('2026-10-22T08:05:00', now)).toBe('08:05')
    expect(formatThreadTime('2026-10-15T08:05:00', now)).toMatch(/15/)
  })
  it('contador del menú del cliente: pendientes + no leídos', () => {
    expect(portalBadgeCount({ pendingProposals: 2, unreadMessages: 3 })).toBe(5)
    expect(portalBadgeCount(undefined)).toBe(0)
  })
})

describe('interacciones del portal', () => {
  it('sin campaña o con canal "portal" son del Portal del cliente', () => {
    expect(interactionOrigin({ executionId: null, campaignId: null, channel: 'portal' })).toBe('PORTAL')
    expect(interactionOrigin({ executionId: null, campaignId: null })).toBe('PORTAL')
    expect(interactionOrigin({ executionId: 4, campaignId: 1 })).toBe('AUTO')
    expect(interactionOrigin({ executionId: null, campaignId: 1, channel: 'llamada' })).toBe('MANUAL')
    expect(channelDisplay('portal')).toBe('Portal del cliente')
  })
})
