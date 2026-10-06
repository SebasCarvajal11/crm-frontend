import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  acceptInviteRequest,
  forgotPasswordRequest,
  getInvitationPreviewRequest,
  loginRequest,
  resetPasswordRequest,
  verifyEmailRequest,
} from '@/features/auth/api'
import { parseApiError } from '@/features/auth/utils'
import { useSessionStore } from '@/app/session/session-store'
import type { LoginRequestValues } from '@/features/auth/model'
import { setAvatarPresetRequest } from '@/shared/api'
import { getRandomAvatarSelection } from '@/shared/lib/avatar-catalog'

export function useLoginFlow() {
  const navigate = useNavigate({ from: '/login' })
  const queryClient = useQueryClient()
  const setSession = useSessionStore((s) => s.setSession)

  return useMutation({
    mutationFn: async (body: LoginRequestValues) => {
      try {
        return await loginRequest(body.email, body.password, body.rememberMe)
      } catch (e) {
        throw new Error(await parseApiError(e), { cause: e })
      }
    },
    onSuccess: (data, variables) => {
      queryClient.clear()
      if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      }
      setSession(data.data.access_token, variables.email)
      navigate({ to: '/dashboard' })
    },
  })
}

export function useForgotPasswordFlow() {
  return useMutation({
    mutationFn: async (body: { email: string }) => {
      try {
        return await forgotPasswordRequest(body)
      } catch (e) {
        throw new Error(await parseApiError(e), { cause: e })
      }
    },
  })
}

export function useResetPasswordFlow(token: string | undefined) {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (body: { password: string }) => {
      if (!token) throw new Error('Falta el token de recuperacion')
      try {
        return await resetPasswordRequest({ token, password: body.password })
      } catch (e) {
        throw new Error(await parseApiError(e), { cause: e })
      }
    },
    onSuccess: () => {
      navigate({ to: '/login' })
    },
  })
}

export function useVerifyEmailFlow(token?: string) {
  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error('Falta el token de verificacion.')
      try {
        return await verifyEmailRequest({ token })
      } catch (e) {
        throw new Error(await parseApiError(e), { cause: e })
      }
    },
  })
}

export function useAcceptInviteFlow(token: string) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setSession = useSessionStore((s) => s.setSession)

  const previewQuery = useQuery({
    queryKey: ['invite-preview', token],
    queryFn: () => getInvitationPreviewRequest(token),
    retry: false,
  })

  const mutation = useMutation({
    mutationFn: async (body: {
      password: string
      terms_accepted?: boolean
      avatarId?: number
      color?: string
    }) => {
      try {
        const acceptRes = await acceptInviteRequest({
          token,
          password: body.password,
          terms_accepted: body.terms_accepted,
        })
        return {
          ...acceptRes,
          chosenAvatar:
            body.avatarId !== undefined && body.color
              ? { avatarId: body.avatarId, color: body.color }
              : undefined,
        }
      } catch (e) {
        throw new Error(await parseApiError(e), { cause: e })
      }
    },
    onSuccess: async (data) => {
      const email = previewQuery.data?.data.email ?? null
      const accessToken = data.data.access_token
      setSession(accessToken, email)

      if (data.chosenAvatar) {
        try {
          await setAvatarPresetRequest(accessToken, data.chosenAvatar)
        } catch {
          const fallback = getRandomAvatarSelection()
          let fallbackSaved = false
          try {
            await setAvatarPresetRequest(accessToken, fallback)
            fallbackSaved = true
          } catch {
            // Silently allow activation even if secondary fallback encounters network issues
          }
          if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.setItem(
              'cima_avatar_warning',
              fallbackSaved
                ? 'Hubo un inconveniente al guardar tu avatar seleccionado. Se asignó uno provisional que puedes cambiar en cualquier momento desde tu perfil.'
                : 'Hubo un inconveniente al configurar tu avatar. Puedes seleccionarlo en cualquier momento desde los ajustes de tu perfil.'
            )
          }
        }
      }

      queryClient.removeQueries({ queryKey: ['invite-preview', token] })
      void queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== 'invite-preview',
      })
      navigate({ to: '/dashboard' })
    },
  })

  return { previewQuery, mutation }
}


