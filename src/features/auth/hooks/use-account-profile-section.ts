import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentAvatarRequestOptional, setAvatarPresetRequest } from '@/shared/api'
import { parseApiError } from '@/features/auth/utils'
import { getAccessTokenSubject } from '@/shared/lib/access-token-role'
import { AvatarDirectoryService } from '@/shared/lib/avatar-directory-service'
import { useEmailVerificationRequest } from './use-email-verification'

const avatarQueryKey = (token: string) => ['media', 'avatar', 'current', token] as const

export function useAccountProfileSection(accessToken: string) {
  const queryClient = useQueryClient()
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)

  const avatarQ = useQuery({
    queryKey: avatarQueryKey(accessToken),
    queryFn: () => getCurrentAvatarRequestOptional(accessToken),
    retry: false,
  })

  const avatarUrl = useMemo(() => {
    const urls = avatarQ.data?.data.urls
    return urls?.['512'] ?? urls?.['256'] ?? urls?.['64'] ?? null
  }, [avatarQ.data])

  const saveAvatarPresetMutation = useMutation({
    mutationFn: async (payload: { avatarId: number; color: string }) => {
      try {
        return await setAvatarPresetRequest(accessToken, payload)
      } catch (e) {
        throw new Error(await parseApiError(e), { cause: e })
      }
    },
    onSuccess: (_data, variables) => {
      const sub = getAccessTokenSubject(accessToken)
      if (sub && variables) {
        AvatarDirectoryService.updateUserPreset(sub, variables)
      } else {
        AvatarDirectoryService.invalidate(queryClient)
      }
      void queryClient.invalidateQueries({ queryKey: avatarQueryKey(accessToken) })
      void queryClient.invalidateQueries({ queryKey: ['media'] })
      setAvatarPickerOpen(false)
    },
  })

  const verifyMutation = useEmailVerificationRequest(accessToken)

  const handleSaveAvatarPreset = async (selection: { avatarId: number; color: string }) => {
    await saveAvatarPresetMutation.mutateAsync(selection)
  }

  const avatarData = avatarQ.data?.data
  const avatarId = avatarData?.avatarId ?? null
  const avatarColor = avatarData?.color ?? null

  return {
    avatarColor,
    avatarId,
    avatarPickerOpen,
    avatarQ,
    avatarUrl,
    handleSaveAvatarPreset,
    saveAvatarPresetMutation,
    setAvatarPickerOpen,
    verifyMutation,
  }
}
