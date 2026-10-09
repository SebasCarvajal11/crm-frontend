import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MeResponse, UserAvatarsResponse } from '@/shared/types'
import type { ProjectChatMessage, ProjectMember } from '@/features/collab/model'
import { ChatMessageList } from './chat-message-list'
import {
  formatDaySeparator,
  formatMessageTime,
  getAuthorDisplayName,
  getAuthorRoleTag,
  isSameDay,
} from './chat/chat-message-types'

const mockIdentity: MeResponse['data'] = {
  id: 'user-me-1',
  email: 'me@cima.co',
  role: 'admin',
  first_name: 'Admin',
  last_name: 'CIMA',
  client_kind: null,
  company_name: null,
  profession: null,
  emailVerifiedAt: '2026-01-01T00:00:00Z',
}

const mockMember: ProjectMember = {
  projectId: 'proj-1',
  userSub: 'user-other-2',
  role: 'client',
  email: 'client@empresa.com',
  first_name: 'Carlos',
  last_name: 'Gómez',
  client_kind: null,
  company_name: null,
  profession: null,
  taskCount: 0,
  lastSeenAt: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const mockMemberMap = new Map<string, ProjectMember>([['user-other-2', mockMember]])

const mockAvatars: UserAvatarsResponse['data']['items'] = {}

const createMockMessage = (
  overrides: Partial<ProjectChatMessage> = {}
): ProjectChatMessage => ({
  id: 'msg-default',
  projectId: 'proj-1',
  channel: 'external',
  messageType: 'text',
  authorSub: 'user-me-1',
  authorEmail: 'me@cima.co',
  authorFirstName: 'Admin',
  authorLastName: 'CIMA',
  authorRole: 'admin',
  authorProfession: null,
  body: 'Mensaje de prueba',
  mentionedSubs: null,
  metadata: null,
  createdAt: '2026-04-01T10:00:00Z',
  ...overrides,
})

describe('ChatMessageList', () => {
  it('muestra estado vacío cuando no hay mensajes', () => {
    const markup = renderToStaticMarkup(
      <ChatMessageList
        messages={[]}
        identity={mockIdentity}
        memberBySub={mockMemberMap}
        avatarBySub={mockAvatars}
        highlightMessageId={null}
      />
    )
    expect(markup).toContain('Aun no hay mensajes en este canal.')
  })

  it('renderiza mensaje enviado propio con recibo de lectura simple', () => {
    const messages: ProjectChatMessage[] = [
      createMockMessage({
        id: 'msg-1',
        body: 'Hola, documento recibido.',
        readStatus: { isSeen: false, seenCount: 0, requiredCount: 1 },
      }),
    ]

    const markup = renderToStaticMarkup(
      <ChatMessageList
        messages={messages}
        identity={mockIdentity}
        memberBySub={mockMemberMap}
        avatarBySub={mockAvatars}
        highlightMessageId={null}
      />
    )

    expect(markup).toContain('Hola, documento recibido.')
    expect(markup).toContain('data-testid="chat-read-receipt-btn"')
    expect(markup).toContain('data-seen-state="sent"')
  })

  it('renderiza recibo de lectura con doble check y morphing cuando es visto por todos', () => {
    const messages: ProjectChatMessage[] = [
      createMockMessage({
        id: 'msg-2',
        body: 'Confirmación de pago procesada.',
        readStatus: { isSeen: true, seenCount: 2, requiredCount: 2 },
      }),
    ]

    const markup = renderToStaticMarkup(
      <ChatMessageList
        messages={messages}
        identity={mockIdentity}
        memberBySub={mockMemberMap}
        avatarBySub={mockAvatars}
        highlightMessageId={null}
      />
    )

    expect(markup).toContain('data-seen-state="fully-seen"')
    expect(markup).toContain('text-sky-500')
    expect(markup).toContain('animate-read-receipt-morph')
  })

  it('renderiza mensaje de sistema con badge y formato de hora', () => {
    const messages: ProjectChatMessage[] = [
      createMockMessage({
        id: 'msg-sys-1',
        authorSub: null,
        body: 'Elena Restrepo ha cambiado el estado de una tarea.',
        messageType: 'milestone',
      }),
    ]

    const markup = renderToStaticMarkup(
      <ChatMessageList
        messages={messages}
        identity={mockIdentity}
        memberBySub={mockMemberMap}
        avatarBySub={mockAvatars}
        highlightMessageId={null}
      />
    )

    expect(markup).toContain('Elena Restrepo ha cambiado el estado de una tarea.')
    expect(markup).toContain('rounded-full border bg-muted/60')
  })

  it('renderiza mensaje tipo milestone con distintivo CIMA y estilo esmeralda', () => {
    const messages: ProjectChatMessage[] = [
      createMockMessage({
        id: 'msg-milestone-1',
        authorSub: 'user-me-1',
        body: 'Fase 1 completada y aprobada por el cliente.',
        messageType: 'milestone',
      }),
    ]

    const markup = renderToStaticMarkup(
      <ChatMessageList
        messages={messages}
        identity={mockIdentity}
        memberBySub={mockMemberMap}
        avatarBySub={mockAvatars}
        highlightMessageId={null}
      />
    )

    expect(markup).toContain('Hito del proyecto')
    expect(markup).toContain('bg-emerald-600')
    expect(markup).toContain('Fase 1 completada y aprobada por el cliente.')
  })

  it('formatea correctamente días y horas mediante utilidades de chat', () => {
    const date1 = new Date('2026-04-01T10:00:00Z')
    const date2 = new Date('2026-04-01T15:30:00Z')
    const date3 = new Date('2026-04-02T10:00:00Z')

    expect(isSameDay(date1, date2)).toBe(true)
    expect(isSameDay(date1, date3)).toBe(false)
    expect(formatMessageTime(date1.toISOString())).toMatch(/\d{2}:\d{2}/)
    expect(formatDaySeparator(new Date().toISOString())).toBe('Hoy')
  })

  it('resuelve nombres y roles de autor correctamente', () => {
    const message = createMockMessage({
      id: 'msg-5',
      authorSub: 'user-other-2',
      authorFirstName: null,
      authorLastName: null,
      authorEmail: 'client@empresa.com',
    })

    expect(getAuthorDisplayName(message, mockMemberMap)).toBe('Carlos Gómez')
    expect(getAuthorRoleTag(message, mockMemberMap)).toBe('Cliente')
  })

  it('renderiza UserAvatar tanto en mensajes propios como en mensajes ajenos con color corporativo', () => {
    const messages: ProjectChatMessage[] = [
      createMockMessage({
        id: 'msg-foreign',
        authorSub: 'user-other-2',
        body: 'Mensaje de otro usuario',
      }),
      createMockMessage({
        id: 'msg-own',
        authorSub: 'user-me-1',
        body: 'Mensaje propio',
      }),
    ]

    const avatarsWithColor: UserAvatarsResponse['data']['items'] = {
      'user-other-2': {
        version: 1,
        avatarId: 10,
        color: '#1e3a8a',
        urls: { '64': '/avatars/avatar-10.webp' },
      },
      'user-me-1': {
        version: 1,
        avatarId: 4,
        color: '#86070c',
        urls: { '64': '/avatars/avatar-4.webp' },
      },
    }

    const markup = renderToStaticMarkup(
      <ChatMessageList
        messages={messages}
        identity={mockIdentity}
        memberBySub={mockMemberMap}
        avatarBySub={avatarsWithColor}
        highlightMessageId={null}
      />
    )

    expect(markup).toContain('data-testid="user-avatar"')
    expect(markup).toContain('background-color:#1e3a8a')
    expect(markup).toContain('background-color:#86070c')
    expect(markup).toContain('src="/avatars/avatar-10.webp"')
    expect(markup).toContain('src="/avatars/avatar-4.webp"')
  })
})
