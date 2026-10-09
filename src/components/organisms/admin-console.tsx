import { useState } from 'react'
import { HardDrive, Layers, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { PageHeader } from '@/components/molecules/page-header'
import { SectionTabs, type SectionTabItem } from '@/components/molecules/section-tabs'
import { Button } from '@/components/ui/button'
import { AdminKpiCards } from './admin/admin-kpi-cards'
import { AdminStorageCard } from './admin/admin-storage-card'
import { AdminFileManager } from './admin/admin-file-manager'
import { AdminUserTable } from './admin/user-table'
import { AdminInviteForms } from './admin/invite-forms'

type Props = {
  accessToken: string
}

type AdminSubTab = 'all' | 'users' | 'storage' | 'invites'

const TABS: SectionTabItem<AdminSubTab>[] = [
  { value: 'all', label: 'Vista General', shortLabel: 'General', icon: <Layers className="size-4" /> },
  { value: 'users', label: 'Usuarios y Roles', shortLabel: 'Usuarios', icon: <Users className="size-4" /> },
  { value: 'storage', label: 'Almacenamiento y Archivos', shortLabel: 'Archivos', icon: <HardDrive className="size-4" /> },
  { value: 'invites', label: 'Centro de Incorporación', shortLabel: 'Incorporación', icon: <UserPlus className="size-4" /> },
]

function AdminConsoleHeader({ onNewInvite }: { onNewInvite: () => void }) {
  return (
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
        actions={
          <Button
            size="sm"
            className="gap-1.5 h-9"
            onClick={onNewInvite}
          >
            <UserPlus className="size-4" />
            Nuevo usuario o rol
          </Button>
        }
      />
    </div>
  )
}

function AdminConsoleSections({
  activeTab,
  accessToken,
}: {
  activeTab: AdminSubTab
  accessToken: string
}) {
  const showUsers = activeTab === 'all' || activeTab === 'users'
  const showInvites = activeTab === 'all' || activeTab === 'invites'
  const showStorage = activeTab === 'all' || activeTab === 'storage'

  return (
    <div key={activeTab} className="tab-pane-transition space-y-8">
      {showUsers && (
        <div className="space-y-6 animate-fade-up">
          <AdminKpiCards accessToken={accessToken} />
          <AdminUserTable accessToken={accessToken} />
        </div>
      )}

      {showInvites && (
        <div className="animate-fade-up stagger-1">
          <AdminInviteForms accessToken={accessToken} />
        </div>
      )}

      {showStorage && (
        <div className="space-y-6 animate-fade-up stagger-2">
          <AdminStorageCard accessToken={accessToken} />
          <AdminFileManager accessToken={accessToken} />
        </div>
      )}
    </div>
  )
}

/** Organismo raiz de la consola de administracion ejecutiva (solo admin). */
export function AdminConsole({ accessToken }: Props) {
  const [activeTab, setActiveTab] = useState<AdminSubTab>('all')

  return (
    <div className="space-y-6">
      <AdminConsoleHeader onNewInvite={() => setActiveTab('invites')} />

      <div data-tour="admin-tabs">
        <SectionTabs
          items={TABS}
          value={activeTab}
          onValueChange={setActiveTab}
          ariaLabel="Secciones de administración"
          itemRole="button"
          dataTourPrefix="admin-tab"
        />
      </div>

      <AdminConsoleSections activeTab={activeTab} accessToken={accessToken} />
    </div>
  )
}
