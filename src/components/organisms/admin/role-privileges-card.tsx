import { CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { InviteRole } from './invite-role-switcher.types'

type RolePrivilegeData = {
  badge: string
  badgeVariant: string
  description: string
  permissions: string[]
  restrictions: string[]
}

const PRIVILEGES_BY_ROLE: Record<InviteRole, RolePrivilegeData> = {
  client: {
    badge: 'Portal Externo',
    badgeVariant: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    description: 'Acceso acotado y seguro para el seguimiento transparente de proyectos contratados.',
    permissions: [
      'Acceso al Portal de Cliente con vista ejecutiva',
      'Firma electrónica de contratos con sello de tiempo',
      'Lectura de Brief del proyecto y trazabilidad de avances',
      'Canal de mensajería directo con el equipo asignado',
      'Emisión y consulta de solicitudes de cambios',
    ],
    restrictions: [
      'Sin acceso a canales de comunicación interna del equipo',
      'Sin visibilidad de costos operativos ni finanzas internas',
      'Sin facultades de administración ni gobernanza global',
    ],
  },
  worker: {
    badge: 'Equipo Operativo',
    badgeVariant: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    description: 'Colaborador interno para ejecución de tareas, proyectos y gestión de entregables.',
    permissions: [
      'Gestión operativa en tablero Kanban y listas de tareas',
      'Creación, edición y resolución de tareas y subtareas',
      'Carga y organización de archivos en el repositorio',
      'Participación en chat interno de equipo y soporte a clientes',
      'Registro de bloqueos, avances y notas de seguimiento',
    ],
    restrictions: [
      'Sin acceso a la consola de gobernanza y administración',
      'Sin autorización para invitar o revocar usuarios y roles',
      'Sin gestión de cuotas de almacenamiento en la nube',
    ],
  },
  admin: {
    badge: 'Control Total',
    badgeVariant: 'bg-primary/10 text-primary border-primary/20',
    description: 'Gobernanza integral, auditoría, control de accesos e infraestructura institucional.',
    permissions: [
      'Control total sobre usuarios, invitaciones y roles del CRM',
      'Aprobación y firma formal de acuerdos y contratos',
      'Supervisión y cuotas de almacenamiento en la nube',
      'Auditoría de eventos, trazabilidad y logs de microservicios',
      'Acceso irrestricto a analítica y métricas comerciales',
    ],
    restrictions: [
      'Las credenciales de administrador exigen doble factor de autenticación',
    ],
  },
}

type Props = {
  role: InviteRole
}

/** Tarjeta lateral de gobernanza: desglosa privilegios y restricciones del rol activo. */
export function RolePrivilegesCard({ role }: Props) {
  const data = PRIVILEGES_BY_ROLE[role]

  return (
    <Card
      key={role}
      className={[
        'w-full overflow-hidden rounded-2xl border-border/80 bg-card',
        'shadow-md shadow-black/[0.04] animate-in fade-in duration-200',
      ].join(' ')}
    >
      <CardHeader className="border-b bg-muted/20 p-4 sm:p-5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4.5 text-primary" aria-hidden="true" />
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Alcances y Privilegios
            </CardTitle>
          </div>
          <Badge className={`rounded-full border text-[10px] font-semibold shrink-0 ${data.badgeVariant}`}>
            {data.badge}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground leading-relaxed">
          {data.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Capacidades concedidas
          </p>
          <ul className="space-y-2">
            {data.permissions.map((perm) => (
              <li key={perm} className="flex items-start gap-2.5 text-xs text-foreground/90">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <span className="leading-snug">{perm}</span>
              </li>
            ))}
          </ul>
        </div>

        {data.restrictions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/60">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Límites y restricciones
            </p>
            <ul className="space-y-1.5">
              {data.restrictions.map((rest) => (
                <li key={rest} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldAlert className="size-3.5 shrink-0 text-amber-500/80 mt-0.5" />
                  <span className="leading-snug">{rest}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
