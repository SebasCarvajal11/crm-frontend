export function pickAvatarUrl(
  urls: Partial<Record<'64' | '256' | '512' | '1024', string>> | null | undefined,
  preferred: '64' | '256' | '512' | '1024' = '64'
): string | null {
  if (!urls) return null
  if (urls[preferred]) return urls[preferred] ?? null
  return urls['64'] ?? urls['256'] ?? urls['512'] ?? urls['1024'] ?? null
}

export function extractUserInitials(name?: string | null): string {
  if (!name || !name.trim()) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase()
}
