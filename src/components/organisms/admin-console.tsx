import { ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/molecules/page-header'
import { AdminKpiCards } from './admin/admin-kpi-cards'
import { AdminStorageCard } from './admin/admin-storage-card'
import { AdminFileManager } from './admin/admin-file-manager'
import { AdminUserTable } from './admin/user-table'
import { AdminInviteForms } from './admin/invite-forms'

type Props = {
  accessToken: string
}

/** Organismo raiz de la consola de administracion ejecutiva (solo admin). */
export function AdminConsole({ accessToken }: Props) {
  return (
    <div className="space-y-8">
      <div data-tour="admin-header">
        <PageHeader
          eyebrow={
            <>
              Control y <span className="font-black text-primary">Gobernanza</span>
            </>
          }
          title={
            <>
              Consola de{' '}
              <span className="font-black tracking-tight text-foreground">
                Administración
              </span>
            </>
          }
          description="Centro ejecutivo para la gobernanza de usuarios, control de roles y ciclo de vida de accesos."
          icon={ShieldCheck}
        />
      </div>
      <div className="animate-fade-up">
        <AdminKpiCards accessToken={accessToken} />
      </div>
      <div className="animate-fade-up stagger-1">
        <AdminStorageCard accessToken={accessToken} />
      </div>
      <div className="animate-fade-up stagger-2">
        <AdminFileManager accessToken={accessToken} />
      </div>
      <div className="animate-fade-up stagger-3">
        <AdminUserTable accessToken={accessToken} />
      </div>
      <div className="animate-fade-up stagger-4">
        <AdminInviteForms accessToken={accessToken} />
      </div>
    </div>
  )
}
