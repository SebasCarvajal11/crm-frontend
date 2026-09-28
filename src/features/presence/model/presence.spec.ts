import { describe, expect, it, vi, afterEach } from 'vitest'
import { activityAge, presenceName, snapshotSchema, type PresenceUser } from './presence'
import { createHeartbeatLoop } from './heartbeat-loop'

const user: PresenceUser = { subject: 'user', email: 'ana@hurl.test', first_name: 'Ana', last_name: 'Pérez', company_name: null,
  is_online: true, last_activity_at: '2026-09-28T12:00:00Z', last_connection_at: null }
describe('presence display and heartbeat lifecycle', () => {
  afterEach(() => vi.useRealTimers())
  it('uses full name, company or email alias without empty titles', () => {
    expect(presenceName(user)).toBe('Ana Pérez')
    expect(presenceName({ ...user, first_name: null, last_name: null, company_name: 'CIMA' })).toBe('CIMA')
    expect(presenceName({ ...user, first_name: null, last_name: null })).toBe('ana')
  })
  it('uses server-relative time and never reports negative ages', () => {
    const now = Date.parse(user.last_activity_at)
    expect(activityAge(user.last_activity_at, now - 100_000)).toBe('hace unos segundos')
    expect(activityAge(user.last_activity_at, now + 120_000)).toBe('hace 2 minutos')
    expect(activityAge(user.last_activity_at, now + 7_200_000)).toBe('hace 2 horas')
    expect(activityAge(user.last_activity_at, now + 86_400_000)).toBe('hace 1 día')
  })
  it('rejects malformed policies and duplicated profile groups', () => {
    const group = { role: 'worker', page: 1, page_size: 10, total: 1, online: 1, users: [user] }
    const snapshot = { as_of: user.last_activity_at, online_for_seconds: 150, refresh_after_seconds: 30, history_days: 7, groups: [group, group, group] }
    expect(snapshotSchema.safeParse(snapshot).success).toBe(false)
    const valid = { ...snapshot, groups: ['worker', 'client', 'admin'].map((role) => ({ ...group, role })) }
    expect(snapshotSchema.safeParse(valid).success).toBe(true)
    expect(snapshotSchema.safeParse({ ...valid, refresh_after_seconds: 1 }).success).toBe(false)
  })
  it('pauses hidden/offline signals and resumes without duplicating requests', async () => {
    vi.useFakeTimers()
    let available = false
    const send = vi.fn().mockResolvedValue(60_000)
    const loop = createHeartbeatLoop(send, () => available)
    await vi.advanceTimersByTimeAsync(120_000)
    expect(send).not.toHaveBeenCalled()
    available = true
    loop.wake(); loop.wake()
    await vi.advanceTimersByTimeAsync(0)
    expect(send).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(60_000)
    expect(send).toHaveBeenCalledTimes(2)
    available = false
    await vi.advanceTimersByTimeAsync(120_000)
    expect(send).toHaveBeenCalledTimes(2)
    loop.stop()
  })
  it('aborts pending work and cancels scheduling after unmount', async () => {
    vi.useFakeTimers()
    let resolve!: (interval: number) => void
    let signal!: AbortSignal
    const send = vi.fn((current: AbortSignal) => { signal = current; return new Promise<number>((done) => { resolve = done }) })
    const loop = createHeartbeatLoop(send, () => true)
    await vi.advanceTimersByTimeAsync(0)
    loop.stop()
    expect(signal.aborted).toBe(true)
    resolve(60_000)
    await vi.advanceTimersByTimeAsync(300_000)
    expect(send).toHaveBeenCalledTimes(1)
  })
  it('backs off failures instead of repeatedly retrying on visibility events', async () => {
    vi.useFakeTimers()
    const send = vi.fn().mockRejectedValue(new Error('offline'))
    const loop = createHeartbeatLoop(send, () => true)
    await vi.advanceTimersByTimeAsync(0)
    loop.wake(); loop.wake()
    await vi.advanceTimersByTimeAsync(59_999)
    expect(send).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(send).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(119_999)
    expect(send).toHaveBeenCalledTimes(2)
    loop.stop()
  })
  it('cancels StrictMode setup replay before sending the first signal', async () => {
    vi.useFakeTimers()
    const send = vi.fn().mockResolvedValue(60_000)
    const loop = createHeartbeatLoop(send, () => true)
    loop.stop()
    await vi.advanceTimersByTimeAsync(1)
    expect(send).not.toHaveBeenCalled()
  })
})
