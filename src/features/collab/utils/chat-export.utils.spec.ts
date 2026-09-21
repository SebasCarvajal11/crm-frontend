import { describe, it, expect, vi } from 'vitest'
import {
  calculateSha256Hex,
  buildExportPayload,
  buildWhatsAppForensicTranscript,
  buildAuditJsonTranscript,
} from './chat-export.utils'
import type { ChatExportOptions } from './chat-export.types'
import type { ProjectChatMessage, ProjectMember } from '../model'
import type { MeResponse } from '@/shared/types'

describe('Chat Export Utilities (Evidentiary & WhatsApp Forensic Standard)', () => {
  const mockIssuer: MeResponse['data'] = {
    id: 'admin-uuid-1',
    email: 'admin@cima.dev',
    first_name: 'Administrador',
    last_name: 'CIMA',
    role: 'admin',
    client_kind: null,
    company_name: 'CIMA',
    profession: null,
    emailVerifiedAt: '2026-01-01T00:00:00Z',
  }

  const mockMembers: ProjectMember[] = [
    {
      projectId: 'proj-uuid-123',
      userSub: 'admin-uuid-1',
      email: 'admin@cima.dev',
      role: 'admin',
      first_name: 'Administrador',
      last_name: 'CIMA',
      client_kind: null,
      company_name: null,
      profession: null,
      taskCount: 0,
      lastSeenAt: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      projectId: 'proj-uuid-123',
      userSub: 'client-uuid-2',
      email: 'cliente@empresa.com',
      role: 'client',
      first_name: 'Carlos',
      last_name: 'Cliente',
      client_kind: 'natural',
      company_name: null,
      profession: null,
      taskCount: 0,
      lastSeenAt: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ]

  const mockMessages: ProjectChatMessage[] = [
    {
      id: 'msg-uuid-1',
      projectId: 'proj-1',
      channel: 'external',
      messageType: 'text',
      authorSub: 'client-uuid-2',
      authorEmail: 'cliente@empresa.com',
      authorFirstName: 'Carlos',
      authorLastName: 'Cliente',
      authorRole: 'client',
      authorProfession: null,
      body: 'Buenos días, adjuntamos observaciones a la propuesta.',
      mentionedSubs: null,
      metadata: null,
      createdAt: '2026-09-21T10:00:00.000Z',
      readStatus: {
        isSeen: true,
        requiredCount: 1,
        seenCount: 1,
        reads: [
          {
            userSub: 'admin-uuid-1',
            readAt: '2026-09-21T10:05:00.000Z',
            firstName: 'Administrador',
            lastName: 'CIMA',
            role: 'admin',
          },
        ],
      },
    },
    {
      id: 'msg-uuid-2',
      projectId: 'proj-1',
      channel: 'external',
      messageType: 'text',
      authorSub: 'admin-uuid-1',
      authorEmail: 'admin@cima.dev',
      authorFirstName: 'Administrador',
      authorLastName: 'CIMA',
      authorRole: 'admin',
      authorProfession: null,
      body: 'Recibido Carlos, procedemos a realizar los ajustes solicitados.',
      mentionedSubs: null,
      metadata: null,
      createdAt: '2026-09-21T10:15:00.000Z',
    },
  ]

  const mockOptions: ChatExportOptions = {
    projectId: 'proj-uuid-123',
    projectName: 'Campaña Lanzamiento 2026',
    channel: 'external',
    format: 'txt',
    members: mockMembers,
    issuer: mockIssuer,
  }

  it('calculates deterministic SHA-256 hexadecimal hash', async () => {
    const hash1 = await calculateSha256Hex('CIMA CRM Test String')
    const hash2 = await calculateSha256Hex('CIMA CRM Test String')
    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64)
    expect(hash1).toMatch(/^[0-9A-F]{64}$/)
  })

  it('builds a complete ChatExportPayload with participants and metadata', () => {
    const payload = buildExportPayload(mockOptions, mockMessages)
    expect(payload.projectId).toBe('proj-uuid-123')
    expect(payload.projectName).toBe('Campaña Lanzamiento 2026')
    expect(payload.issuer.email).toBe('admin@cima.dev')
    expect(payload.issuer.role).toBe('admin')
    expect(payload.participants).toHaveLength(2)
    expect(payload.messagesCount).toBe(2)
    expect(payload.messages).toEqual(mockMessages)
  })

  it('generates WhatsApp-style forensic transcript with legal header and SHA-256 seal', async () => {
    const payload = buildExportPayload(mockOptions, mockMessages)
    const { content, hash } = await buildWhatsAppForensicTranscript(payload, mockMembers)

    expect(content).toContain('CIMA CRM — REGISTRO PROBATORIO OFICIAL DE CONVERSACIÓN')
    expect(content).toContain('Ley 527 de 1999 (Mensajes de Datos) / ISO/IEC 27037:2012')
    expect(content).toContain('Campaña Lanzamiento 2026')
    expect(content).toContain('Carlos Cliente (client)')
    expect(content).toContain('Buenos días, adjuntamos observaciones a la propuesta.')
    expect(content).toContain('Recibido Carlos, procedemos a realizar los ajustes solicitados.')
    expect(content).toContain('Leído por: Administrador CIMA')
    expect(content).toContain(`Resumen Criptográfico de Integridad (SHA-256): ${hash}`)
  })

  it('generates structured audit JSON with embedded SHA-256 hash', async () => {
    const payload = buildExportPayload(mockOptions, mockMessages)
    const { content, hash } = await buildAuditJsonTranscript(payload)

    const parsed = JSON.parse(content)
    expect(parsed.integritySha256).toBe(hash)
    expect(parsed.messagesCount).toBe(2)
    expect(parsed.messages[0].body).toContain('Buenos días')
  })

  it('fetches multi-page messages and combines channels in chronological order', async () => {
    const { fetchAllExportMessages } = await import('./chat-export.utils')
    const chatApi = await import('../api/collab-api.chat')

    const extSpy = vi.spyOn(chatApi, 'listExternalChatRequest').mockResolvedValueOnce({
      data: {
        items: [mockMessages[0]],
        total: 101,
        page: 1,
        limit: 100,
      },
    } as any).mockResolvedValueOnce({
      data: {
        items: [mockMessages[1]],
        total: 101,
        page: 2,
        limit: 100,
      },
    } as any)

    const result = await fetchAllExportMessages('fake-token', 'proj-1', 'external')
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('msg-uuid-1')
    expect(result[1].id).toBe('msg-uuid-2')
    extSpy.mockRestore()
  })
})
