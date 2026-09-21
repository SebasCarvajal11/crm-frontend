export type ProjectNotification = {
  id: string
  source: 'mention' | 'activity'
  project_id: string
  project_name: string
  channel: 'internal' | 'external' | 'system'
  created_at: string
  title: string
  body: string
  resource_type: string
  resource_id: string | null
  message_id: string | null
  author_sub: string | null
  author_email: string | null
}
