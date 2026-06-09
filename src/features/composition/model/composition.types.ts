import type { UserRole, ProjectListItem } from '@/shared/types'
import { z } from 'zod'

/** Respuesta de la composición del dashboard: identidad + proyectos en un solo fetch. */
export type DashboardCompositionResponse = {
  identity: {
    email: string
    role: UserRole
    id: string
    first_name: string | null
    last_name: string | null
    client_kind: 'natural' | 'juridical' | null
    company_name: string | null
    profession: string | null
    emailVerifiedAt: string | null
    force_password_change?: boolean
  }
  projects: {
    data: ProjectListItem[]
  }
}

const dashboardIdentitySchema = z.object({
  email: z.string(),
  role: z.enum(['admin', 'worker', 'client']),
  id: z.string().uuid(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  client_kind: z.enum(['natural', 'juridical']).nullable().optional(),
  company_name: z.string().nullable().optional(),
  profession: z.string().nullable().optional(),
  emailVerifiedAt: z.string().nullable().optional(),
  force_password_change: z.boolean().optional(),
})

const projectListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  clientName: z.string(),
  type: z.enum(['campaign_service', 'product_order']),
  status: z.enum(['todo', 'in_progress', 'in_review', 'completed']),
  progressPercent: z.number().int(),
  unreadNotifications: z.number().int(),
})

export const dashboardCompositionResponseSchema = z.object({
  identity: dashboardIdentitySchema,
  projects: z.object({
    data: z.array(projectListItemSchema).optional(),
  }),
})
