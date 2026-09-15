import { Archive, Briefcase, ShieldCheck, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminStats } from '@/features/admin/hooks'

type Props = {
  accessToken: string
}

type KpiItem = {
  title: string
  value: number | undefined
  description: string
  icon: React.ReactNode
  accentBg: string
  accentText: string
  borderColor: string
}

function KpiCard({ item, isLoading }: { item: KpiItem; isLoading: boolean }) {
  return (
    <Card
      className={`relative overflow-hidden rounded-2xl border ${item.borderColor} bg-card/80 p-5 shadow-sm backdrop-blur-sm interactive-card`}
    >
      <CardContent className="flex items-center justify-between p-0">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {item.title}
          </p>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {item.value ?? 0}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{item.description}</p>
        </div>
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${item.accentBg} ${item.accentText}`}
        >
          {item.icon}
        </div>
      </CardContent>
    </Card>
  )
}

/** Organismo molecular: barra de KPIs ejecutivos de administracion. */
export function AdminKpiCards({ accessToken }: Props) {
  const { stats, isLoading } = useAdminStats(accessToken)

  const items: KpiItem[] = [
    {
      title: 'Total Usuarios',
      value: stats?.total,
      description: 'Cuentas activas en la plataforma',
      icon: <Users className="size-6" />,
      accentBg: 'bg-primary/10',
      accentText: 'text-primary',
      borderColor: 'border-primary/20',
    },
    {
      title: 'Equipo Interno',
      value: stats?.internalTeam,
      description: `${stats?.admins ?? 0} Admins · ${stats?.workers ?? 0} Colaboradores`,
      icon: <Briefcase className="size-6" />,
      accentBg: 'bg-cyan-500/10',
      accentText: 'text-cyan-700 dark:text-cyan-400',
      borderColor: 'border-cyan-500/20',
    },
    {
      title: 'Clientes',
      value: stats?.clients,
      description: 'Clientes naturales y jurídicos',
      icon: <ShieldCheck className="size-6" />,
      accentBg: 'bg-emerald-500/10',
      accentText: 'text-emerald-700 dark:text-emerald-400',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Archivados',
      value: stats?.archived,
      description: 'Accesos dados de baja o en espera',
      icon: <Archive className="size-6" />,
      accentBg: 'bg-amber-500/10',
      accentText: 'text-amber-700 dark:text-amber-400',
      borderColor: 'border-amber-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <KpiCard key={item.title} item={item} isLoading={isLoading} />
      ))}
    </div>
  )
}
