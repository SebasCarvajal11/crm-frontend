import { describe, expect, it } from 'vitest'
import { calculateNotificationDeltas } from './notification-delta'
import type { ProjectNotification } from '../model'

const mockNotification = (id: string, title: string): ProjectNotification => ({
  id,
  source: 'activity',
  project_id: 'proj-1',
  project_name: 'Proyecto CIMA',
  channel: 'internal',
  created_at: new Date().toISOString(),
  title,
  body: 'Detalle de prueba',
  resource_type: 'project_task',
  resource_id: 'task-1',
  message_id: null,
  author_sub: 'user-1',
  author_email: 'user@cima.test',
})

describe('calculateNotificationDeltas', () => {
  it('initializes knownIds on initial mount without emitting toasts', () => {
    const items = [mockNotification('1', 'T1'), mockNotification('2', 'T2')]
    const result = calculateNotificationDeltas(items, null)

    expect(result.isInitialMount).toBe(true)
    expect(result.newlyArrived).toEqual([])
    expect(result.updatedKnownIds.has('1')).toBe(true)
    expect(result.updatedKnownIds.has('2')).toBe(true)
  })

  it('detects newly arrived notifications in subsequent cycles', () => {
    const known = new Set(['1', '2'])
    const items = [
      mockNotification('3', 'T3'),
      mockNotification('2', 'T2'),
      mockNotification('1', 'T1'),
    ]
    const result = calculateNotificationDeltas(items, known)

    expect(result.isInitialMount).toBe(false)
    expect(result.newlyArrived).toHaveLength(1)
    expect(result.newlyArrived[0].id).toBe('3')
    expect(result.updatedKnownIds.has('3')).toBe(true)
  })

  it('caps newly arrived toasts to maxToasts limit', () => {
    const known = new Set(['1'])
    const items = [
      mockNotification('2', 'T2'),
      mockNotification('3', 'T3'),
      mockNotification('4', 'T4'),
      mockNotification('5', 'T5'),
      mockNotification('1', 'T1'),
    ]
    const result = calculateNotificationDeltas(items, known, 2)

    expect(result.newlyArrived).toHaveLength(2)
    expect(result.newlyArrived.map((n) => n.id)).toEqual(['2', '3'])
    expect(result.updatedKnownIds.has('5')).toBe(true)
  })

  it('returns empty array when no new notifications exist', () => {
    const known = new Set(['1', '2'])
    const items = [mockNotification('1', 'T1'), mockNotification('2', 'T2')]
    const result = calculateNotificationDeltas(items, known)

    expect(result.newlyArrived).toEqual([])
  })
})
