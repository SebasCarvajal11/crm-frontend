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

/** Organismo raíz del panel de cuenta del usuario con diseño responsivo premium. */
export function AccountPanel({ accessToken, identity }: Props) {
  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <PageHeader
        eyebrow={
          <>
            Perfil y <span className="font-black text-primary">Seguridad</span>
          </>
        }
        title={
          <>
            Ajustes de{' '}
            <span className="font-black tracking-tight text-foreground">
              Mi cuenta
            </span>
          </>
        }
        description="Administra tu perfil personal, dispositivos conectados y la seguridad de acceso."
        icon={UserCircle2}
      />

      <ProfileSection accessToken={accessToken} identity={identity} />

      <div className="grid gap-6 [&>section]:min-w-0 xl:grid-cols-2 xl:items-stretch">
        <SessionsSection accessToken={accessToken} />
        <ChangePasswordSection accessToken={accessToken} />
      </div>
    </div>
  )
}
