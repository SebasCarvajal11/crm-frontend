import type { AvatarSize } from './user-avatar'
import type { UserRole } from '@/shared/types/identity'
import { cn } from '@/shared/lib/utils'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  worker: 'Colaborador',
  client: 'Cliente',
}

const ROLE_HALO_CLASSES: Record<UserRole, string> = {
  admin: 'role-halo-admin',
  worker: 'role-halo-worker',
  client: 'role-halo-client',
}

function getHaloSizeModifier(size?: AvatarSize): string | undefined {
  if (size === 'lg' || size === 'xl') return 'role-halo-lg'
  if (size === '2xl') return 'role-halo-xl'
  return undefined
}

export function getRoleHaloClasses(
  role?: UserRole | null,
  size: AvatarSize = 'md',
  animated = true
): string | undefined {
  if (!role || !ROLE_HALO_CLASSES[role]) return undefined

  return cn(
    'role-halo',
    ROLE_HALO_CLASSES[role],
    getHaloSizeModifier(size),
    animated && 'role-halo-animated'
  )
}
