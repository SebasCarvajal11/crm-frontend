import { Archive, Briefcase, ShieldCheck, Users } from 'lucide-react'
import { MetricRibbon, type MetricRibbonItem } from '@/components/molecules/metric-ribbon'
import { useAdminStats } from '@/features/admin/hooks'

type Props = {
  accessToken: string
}

/** Organismo molecular: cinta de KPIs ejecutivos de administracion. */
export function AdminKpiCards({ accessToken }: Props) {
  const { stats, isLoading } = useAdminStats(accessToken)

  const items: MetricRibbonItem[] = [
    {
      label: 'Total Usuarios',
      value: stats?.total ?? 0,
      subtext: 'Cuentas activas en plataforma',
      icon: <Users className="size-4" />,
      accent: 'primary',
    },
    {
      label: 'Equipo Interno',
      value: stats?.internalTeam ?? 0,
      subtext: `${stats?.admins ?? 0} Admins · ${stats?.workers ?? 0} Colaboradores`,
      icon: <Briefcase className="size-4" />,
      accent: 'blue',
    },
    {
      label: 'Clientes',
      value: stats?.clients ?? 0,
      subtext: 'Clientes naturales y jurídicos',
      icon: <ShieldCheck className="size-4" />,
      accent: 'emerald',
    },
    {
      label: 'Archivados',
      value: stats?.archived ?? 0,
      subtext: 'Accesos dados de baja o en espera',
      icon: <Archive className="size-4" />,
      accent: 'amber',
    },
  ]

  return (
    <div data-tour="admin-kpis">
      <MetricRibbon
        items={items}
        columns={4}
        isLoading={isLoading}
        skeletonCount={4}
        ariaLabel="KPIs ejecutivos de administración"
      />
    </div>
  )
}
