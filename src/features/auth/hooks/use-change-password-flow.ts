import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { changePasswordRequest } from '@/features/auth/api'
import { strongPasswordSchema } from '@/features/auth/model'
import { parseApiError } from '@/features/auth/utils'
import { useSessionStore } from '@/app/session/session-store'

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, 'Requerido'),
    new_password: strongPasswordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: 'Las contrasenas no coinciden',
    path: ['confirm'],
  })

export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>

export function useChangePasswordFlow(accessToken: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: ChangePasswordPayload) => {
      try {
        await changePasswordRequest(accessToken, {
          old_password: body.old_password,
          new_password: body.new_password,
        })
      } catch (e) {
        throw new Error(await parseApiError(e), { cause: e })
      }
    },
    onSuccess: () => {
      window.setTimeout(() => {
        queryClient.clear()
        useSessionStore.getState().clearSession()
        window.location.replace('/login')
      }, 1200)
    },
  })
}
