import { useMutation } from '@tanstack/react-query'
import { requestEmailVerificationRequest } from '@/features/auth/api'
import { parseApiError } from '@/features/auth/utils'

export function useEmailVerificationRequest(accessToken: string) {
  return useMutation({
    mutationFn: async () => {
      try {
        return await requestEmailVerificationRequest(accessToken)
      } catch (e) {
        throw new Error(await parseApiError(e), { cause: e })
      }
    },
  })
}
