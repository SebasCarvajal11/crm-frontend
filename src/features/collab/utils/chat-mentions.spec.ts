import { describe, expect, it } from 'vitest'
import { resolveMentionsFromBody } from './chat-mentions'
import type { ProjectMember } from '@/features/collab/model'

const member = (userSub: string, role: ProjectMember['role'], email: string): ProjectMember => ({
  projectId: 'project-id', userSub, role, email,
  first_name: null, last_name: null, client_kind: null, company_name: null, profession: null,
  taskCount: 0, lastSeenAt: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
})

const members = [
  member('admin-sub', 'admin', 'admin@cima.dev'),
  member('worker-sub', 'worker', 'ana.worker@cima.dev'),
  member('client-sub', 'client', 'cliente@cima.dev'),
]

describe('resolveMentionsFromBody', () => {
  it('mantiene la política de menciones del backend para los tres roles', () => {
    expect(resolveMentionsFromBody('@administrador @trabajador @cliente', 'admin', members)).toEqual([
      'admin-sub', 'worker-sub', 'client-sub',
    ])
    expect(resolveMentionsFromBody('@administrador @trabajador @cliente', 'worker', members)).toEqual([
      'admin-sub', 'worker-sub', 'client-sub',
    ])
    expect(resolveMentionsFromBody('@administrador @trabajador @cliente', 'client', members)).toEqual([
      'admin-sub', 'worker-sub',
    ])
  })
})
