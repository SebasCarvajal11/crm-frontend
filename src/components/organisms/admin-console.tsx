import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/molecules/page-header'
import { AdminUserTable } from './admin/user-table'
import { AdminInviteForms } from './admin/invite-forms'

type Props = {
  accessToken: string
}

/** Organismo raiz de la consola de administracion (solo admin). */
export function AdminConsole({ accessToken }: Props) {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Administración"
        description="Gestiona los usuarios, roles e invitaciones de la organización."
        icon={ShieldCheck}
      />
      <AdminUserTable accessToken={accessToken} />
      <AdminInviteForms accessToken={accessToken} />
    </div>
  )
}
