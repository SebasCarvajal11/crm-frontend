import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/molecules/page-header'
import { AdminKpiCards } from './admin/admin-kpi-cards'
import { AdminUserTable } from './admin/user-table'
import { AdminInviteForms } from './admin/invite-forms'

type Props = {
  accessToken: string
}

/** Organismo raiz de la consola de administracion ejecutiva (solo admin). */
export function AdminConsole({ accessToken }: Props) {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Administración"
        description="Centro ejecutivo para la gobernanza de usuarios, control de roles y ciclo de vida de accesos."
        icon={ShieldCheck}
      />
      <AdminKpiCards accessToken={accessToken} />
      <AdminUserTable accessToken={accessToken} />
      <AdminInviteForms accessToken={accessToken} />
    </div>
  )
}
