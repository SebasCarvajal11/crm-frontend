import { api } from '@/shared/lib'
import { NOTIFICATION_ROUTES } from '@/shared/lib/gateway-routes'
import { bearer } from './collab-api.projects'
import type { ChatMentionNotification, DataResponse } from '@/features/collab/model'

export async function listUnreadMentionNotificationsRequest(
  accessToken: string
): Promise<DataResponse<ChatMentionNotification[]>> {
  return api
    .get(NOTIFICATION_ROUTES.chatMentionsUnread, { headers: bearer(accessToken) })
    .json<DataResponse<ChatMentionNotification[]>>()
}

export async function countUnreadMentionNotificationsRequest(
  accessToken: string
): Promise<DataResponse<{ unread_count: number }>> {
  return api
    .get(NOTIFICATION_ROUTES.chatMentionsUnreadCount, { headers: bearer(accessToken) })
    .json<DataResponse<{ unread_count: number }>>()
}

export async function markMentionNotificationSeenRequest(
  accessToken: string,
  notificationId: string
): Promise<DataResponse<{ id: string; is_seen: boolean; seen_at: string | null }>> {
  return api
    .patch(NOTIFICATION_ROUTES.chatMentionRead(notificationId), { headers: bearer(accessToken) })
    .json<DataResponse<{ id: string; is_seen: boolean; seen_at: string | null }>>()
}
