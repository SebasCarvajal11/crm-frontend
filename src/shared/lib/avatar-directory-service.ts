import type { QueryClient } from '@tanstack/react-query'
import { getUserAvatarsRequest } from '@/shared/api'
import {
  getAvatarImageUrl,
  resolveDeterministicAvatar,
} from '@/shared/lib/avatar-catalog'
import { pickAvatarUrl } from '@/shared/lib/avatar-utils'
import type { UserAvatarsResponse } from '@/shared/types'

export interface UserAvatarEntity {
  sub: string
  avatarId: number
  color: string
  url: string
  urls: Partial<Record<'64' | '256' | '512', string>>
  version: number
  isFallback: boolean
}

type ResolverQueueItem = {
  resolve: (entity: UserAvatarEntity) => void
  reject: (err: unknown) => void
}

const MAX_BATCH_SIZE = 100

class AvatarDirectoryServiceImpl {
  private cache = new Map<string, UserAvatarEntity>()
  private listeners = new Set<() => void>()
  private pendingQueue = new Map<string, ResolverQueueItem[]>()
  private microtaskScheduled = false
  private currentToken: string | null = null
  private version = 0

  public getSnapshot = (): number => this.version

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    this.version += 1
    for (const listener of this.listeners) {
      try {
        listener()
      } catch {
        // Ignorar excepciones en listeners individuales
      }
    }
  }

  public getDeterministicEntity(sub?: string | null): UserAvatarEntity {
    const key = (sub && typeof sub === 'string') ? sub.trim() : 'cima-default-user'
    const det = resolveDeterministicAvatar(key)
    const url = det.url || getAvatarImageUrl(det.avatarId)
    return {
      sub: key,
      avatarId: det.avatarId,
      color: det.color,
      url,
      urls: { '64': url, '256': url, '512': url },
      version: 1,
      isFallback: true,
    }
  }

  public getEntity(sub?: string | null): UserAvatarEntity {
    if (!sub || typeof sub !== 'string' || !sub.trim()) {
      return this.getDeterministicEntity('anonymous')
    }
    const cleanSub = sub.trim()
    const cached = this.cache.get(cleanSub)
    if (cached) return cached
    return this.getDeterministicEntity(cleanSub)
  }

  public setEntity(sub: string, entity: UserAvatarEntity): void {
    this.cache.set(sub.trim(), entity)
    this.notify()
  }

  public updateUserPreset(
    sub: string,
    selection: { avatarId: number; color: string }
  ): UserAvatarEntity {
    const cleanSub = sub.trim()
    const url = getAvatarImageUrl(selection.avatarId)
    const entity: UserAvatarEntity = {
      sub: cleanSub,
      avatarId: selection.avatarId,
      color: selection.color,
      url,
      urls: { '64': url, '256': url, '512': url },
      version: Date.now(),
      isFallback: false,
    }
    this.cache.set(cleanSub, entity)
    this.notify()
    return entity
  }

  public invalidate(queryClient?: QueryClient, sub?: string): void {
    if (sub) {
      this.cache.delete(sub.trim())
    } else {
      this.cache.clear()
    }
    this.notify()
    if (queryClient) {
      void queryClient.invalidateQueries({ queryKey: ['media'] })
    }
  }

  private normalizeServerPayload(
    sub: string,
    payload?: UserAvatarsResponse['data']['items'][string]
  ): UserAvatarEntity {
    const det = resolveDeterministicAvatar(sub)
    const avatarId = typeof payload?.avatarId === 'number' ? payload.avatarId : det.avatarId
    const color = payload?.color || det.color
    const urls = payload?.urls ?? {}
    const url = pickAvatarUrl(urls, '64') ?? getAvatarImageUrl(avatarId)
    return {
      sub,
      avatarId,
      color,
      url,
      urls,
      version: payload?.version ?? 1,
      isFallback: typeof payload?.avatarId !== 'number',
    }
  }

  private async processBatchChunk(token: string, chunk: string[]): Promise<void> {
    try {
      const resp = await getUserAvatarsRequest(token, chunk)
      const items = resp.data?.items ?? {}
      for (const id of chunk) {
        const entity = this.normalizeServerPayload(id, items[id])
        this.cache.set(id, entity)
        const resolvers = this.pendingQueue.get(id)
        if (resolvers) {
          this.pendingQueue.delete(id)
          resolvers.forEach((r) => r.resolve(entity))
        }
      }
    } catch {
      for (const id of chunk) {
        const entity = this.getDeterministicEntity(id)
        this.cache.set(id, entity)
        const resolvers = this.pendingQueue.get(id)
        if (resolvers) {
          this.pendingQueue.delete(id)
          resolvers.forEach((r) => r.resolve(entity))
        }
      }
    }
  }

  private async flushPendingQueue(): Promise<void> {
    this.microtaskScheduled = false
    const token = this.currentToken
    if (!token) return

    const pendingIds = Array.from(this.pendingQueue.keys())
    if (pendingIds.length === 0) return

    for (let i = 0; i < pendingIds.length; i += MAX_BATCH_SIZE) {
      const chunk = pendingIds.slice(i, i + MAX_BATCH_SIZE)
      await this.processBatchChunk(token, chunk)
    }
    this.notify()
  }

  public async fetchAvatarsBatched(
    accessToken: string,
    ids: string[]
  ): Promise<Record<string, UserAvatarEntity>> {
    this.currentToken = accessToken
    const result: Record<string, UserAvatarEntity> = {}
    const neededIds: string[] = []

    for (const rawId of ids) {
      if (!rawId || typeof rawId !== 'string') continue
      const id = rawId.trim()
      if (!id) continue
      const cached = this.cache.get(id)
      if (cached && !cached.isFallback) {
        result[id] = cached
      } else {
        neededIds.push(id)
      }
    }

    if (neededIds.length === 0) return result

    const promises = neededIds.map((id) => {
      return new Promise<UserAvatarEntity>((resolve, reject) => {
        const list = this.pendingQueue.get(id) ?? []
        list.push({ resolve, reject })
        this.pendingQueue.set(id, list)
      })
    })

    if (!this.microtaskScheduled) {
      this.microtaskScheduled = true
      queueMicrotask(() => {
        void this.flushPendingQueue()
      })
    }

    const fetchedEntities = await Promise.all(promises)
    for (const ent of fetchedEntities) {
      result[ent.sub] = ent
    }
    return result
  }
}

export const AvatarDirectoryService = new AvatarDirectoryServiceImpl()
