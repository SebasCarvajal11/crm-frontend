import type { ReactNode } from 'react'
import { AlertTriangle, Mail } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/shared/lib/utils'
import type { EmailQuota } from '../api/notifications-api'
import { quotaPercent } from './email-quota.utils'

interface EmailQuotaCardProps {
  quota?: EmailQuota | null
  isLoading?: boolean
  isError?: boolean
  /** Botón "Enviar correo de prueba" (solo admin). */
  action?: ReactNode
}

/** Cupo diario de correos en la cabecera de Automatizaciones. */
export function EmailQuotaCard({ quota: raw, isLoading, isError, action }: EmailQuotaCardProps) {
  // Una respuesta sin la forma esperada se trata como error, no como "undefined de undefined".
  const quota = raw && typeof raw.dailyLimit === 'number' && typeof raw.sentToday === 'number' ? raw : null
  const pct = quota ? quotaPercent(quota) : 0
  const agotado = quota ? quota.enabled && quota.remaining <= 0 : false

  return (
    <div
      data-tour="marketing-email-quota"
      className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-2xs sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Mail className="size-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Consultando el cupo de correos…</p>
          ) : isError || !quota ? (
            <p className="text-xs text-muted-foreground">No se pudo consultar el cupo de correos de hoy.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-sm font-semibold">
                  Correos hoy: {quota.sentToday} de {quota.dailyLimit}
                </p>
                <p className="text-xs text-muted-foreground">
                  {agotado
                    ? 'Cupo agotado: los envíos pendientes se reintentan mañana'
                    : `Quedan ${quota.remaining}`}
                </p>
              </div>
              <Progress
                value={pct}
                aria-label={`Correos enviados hoy: ${quota.sentToday} de ${quota.dailyLimit}`}
                indicatorClassName={cn(pct >= 100 ? 'bg-destructive' : pct >= 80 ? 'bg-amber-500' : undefined)}
              />
              {!quota.enabled && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="size-3.5" />
                  Envío de correos en modo simulado
                </p>
              )}
            </>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
