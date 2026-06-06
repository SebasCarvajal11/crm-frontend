import { isHTTPError } from 'ky'

const RETRYABLE_UPLOAD_REGISTRATION_STATUSES = new Set([409, 503])

export function isRetryableUploadRegistrationError(error: unknown): boolean {
  return isHTTPError(error) && RETRYABLE_UPLOAD_REGISTRATION_STATUSES.has(error.response.status)
}

export async function withUploadRegistrationRetries<T>(
  operation: () => Promise<T>,
  options: { attempts?: number; delayMs?: number } = {},
): Promise<T> {
  const attempts = options.attempts ?? 3
  const delayMs = options.delayMs ?? 1500

  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (!isRetryableUploadRegistrationError(error) || attempt === attempts) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw lastError instanceof Error ? lastError : new Error('No se pudo registrar el archivo subido')
}
