export type RefreshFailureReason = 'auth' | 'network'

export class RefreshTokenError extends Error {
  readonly reason: RefreshFailureReason

  constructor(message: string, reason: RefreshFailureReason) {
    super(message)
    this.name = 'RefreshTokenError'
    this.reason = reason
  }
}

export function getRefreshFailureReason(error: unknown): RefreshFailureReason {
  if (error instanceof RefreshTokenError) return error.reason
  if (isNetworkFetchError(error)) return 'network'
  return 'auth'
}

export function classifyRefreshHttpStatus(status: number): RefreshFailureReason {
  if (status === 401 || status === 403) return 'auth'
  if (status >= 500 || status === 408 || status === 429) return 'network'
  return 'auth'
}

function isNetworkFetchError(error: unknown): boolean {
  if (error instanceof TypeError) return true
  if (error instanceof DOMException && error.name === 'AbortError') return true
  return false
}
