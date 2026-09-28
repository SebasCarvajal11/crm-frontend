import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionStore } from './session-store'

class MockStorage implements Storage {
  private store: Record<string, string> = {}
  get length() {
    return Object.keys(this.store).length
  }
  clear() {
    this.store = {}
  }
  getItem(key: string) {
    return this.store[key] ?? null
  }
  key(index: number) {
    return Object.keys(this.store)[index] ?? null
  }
  removeItem(key: string) {
    delete this.store[key]
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }
}

// Polyfill minimal browser globals for Node test environment
if (typeof globalThis.sessionStorage === 'undefined') {
  globalThis.sessionStorage = new MockStorage()
}
if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis as unknown as Window & typeof globalThis
}

describe('useSessionStore (ADR-008: Memory-only volatile session)', () => {
  beforeEach(() => {
    sessionStorage.clear()
    useSessionStore.getState().clearSession()
  })

  it('stores access token in Zustand memory and NEVER writes to sessionStorage', () => {
    const mockToken = 'mock.jwt.token.12345'
    const mockEmail = 'user@cima.com.co'

    useSessionStore.getState().setSession(mockToken, mockEmail)

    // Token must reside in Zustand state
    expect(useSessionStore.getState().token).toBe(mockToken)
    expect(useSessionStore.getState().email).toBe(mockEmail)

    // ADR-008: Must NOT be present in sessionStorage
    expect(sessionStorage.getItem('cima_access_token')).toBeNull()
  })

  it('clears token from memory and cleans storage on clearSession', () => {
    useSessionStore.getState().setSession('temp.token', 'user@cima.com.co')
    expect(useSessionStore.getState().token).toBe('temp.token')

    useSessionStore.getState().clearSession()

    expect(useSessionStore.getState().token).toBeNull()
    expect(useSessionStore.getState().email).toBeNull()
    expect(sessionStorage.getItem('cima_access_token')).toBeNull()
  })

  it('exposes __zustandSessionStore on window / global for Playwright E2E test harness', () => {
    const globalObj = (typeof window !== 'undefined' ? window : globalThis) as unknown as {
      __zustandSessionStore?: typeof useSessionStore
    }
    expect(globalObj.__zustandSessionStore).toBeDefined()
    expect(globalObj.__zustandSessionStore).toBe(useSessionStore)
  })
})
