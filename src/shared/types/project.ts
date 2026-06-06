export type ProjectType = 'campaign_service' | 'product_order'
export type ParentProjectStatus = 'todo' | 'in_progress' | 'in_review' | 'completed'

/** Campos devueltos por GET /projects (filtrado por gateway allow list). */
export type ProjectListItem = {
  id: string
  name: string
  clientName: string
  type: ProjectType
  status: ParentProjectStatus
  progressPercent: number
  unreadNotifications: number
  estimatedDueDate?: string | null
  createdAt?: string
  updatedAt?: string
  isArchived?: boolean
}
