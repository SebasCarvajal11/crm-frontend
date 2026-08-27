import { api } from '@/shared/lib'
import { NOTIFICATION_ROUTES } from '@/shared/lib/gateway-routes'
import { bearer } from './collab-api.projects'
import type { DataResponse, ProjectNotification } from '@/features/collab/model'

export async function listUnreadNotificationsRequest(accessToken: string): Promise<DataResponse<ProjectNotification[]>> {
  return api.get(NOTIFICATION_ROUTES.unread, { headers: bearer(accessToken) }).json<DataResponse<ProjectNotification[]>>()
}

export async function countUnreadNotificationsRequest(accessToken: string): Promise<DataResponse<{ unread_count: number }>> {
  return api.get(NOTIFICATION_ROUTES.unreadCount, { headers: bearer(accessToken) }).json<DataResponse<{ unread_count: number }>>()
}

export async function markNotificationSeenRequest(accessToken: string, notificationId: string): Promise<DataResponse<{ id: string; is_seen: boolean; seen_at: string | null }>> {
  return api.patch(NOTIFICATION_ROUTES.read(notificationId), { headers: bearer(accessToken) }).json<DataResponse<{ id: string; is_seen: boolean; seen_at: string | null }>>()
}
