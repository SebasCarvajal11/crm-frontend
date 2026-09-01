import { UserCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/molecules/page-header'
import { ProfileSection } from './account/profile-section'
import { SessionsSection } from './account/sessions-section'
import { ChangePasswordSection } from './account/change-password-section'
import type { MeResponse } from '@/features/auth/model'

type Props = {
  accessToken: string
  identity: MeResponse['data']
}

/** Organismo raiz del panel de cuenta del usuario. */
export function AccountPanel({ accessToken, identity }: Props) {
  return (
    <div className="w-full min-w-0 space-y-10">
      <PageHeader
        title="Mi cuenta"
        description="Administra tu perfil, las sesiones activas y la seguridad de acceso."
        icon={UserCircle2}
      />
      <ProfileSection accessToken={accessToken} identity={identity} />
      <div className="grid gap-6 [&>section]:min-w-0 lg:grid-cols-2 lg:items-start">
        <SessionsSection accessToken={accessToken} />
        <ChangePasswordSection accessToken={accessToken} />
      </div>
    </div>
  )
}

