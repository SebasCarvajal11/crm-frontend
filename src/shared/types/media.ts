export type AvatarPresetResponse = {
  data: {
    version: number
    avatarId: number
    color: string
    urls: Record<'64' | '256' | '512' | '1024', string> | Record<string, string>
  }
}

export type CurrentAvatarResponse = {
  data: {
    version: number
    avatarId?: number | null
    color?: string | null
    urls: Partial<Record<'64' | '256' | '512' | '1024', string>>
  }
}

export type DocumentUploadResponse = {
  data: {
    objectKey: string
  }
}

export type UserAvatarsResponse = {
  data: {
    items: Record<
      string,
      {
        version: number
        avatarId?: number | null
        color?: string | null
        urls: Partial<Record<'64' | '256' | '512' | '1024', string>>
      }
    >
  }
}
