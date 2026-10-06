import { Clock, KeyRound, Lock, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/shared/lib/utils'

const SECURITY_STEPS = [
  {
    step: '1',
    icon: KeyRound,
    title: 'Token criptográfico efímero',
    desc: 'Se genera un identificador seguro de un solo uso asociado exclusivamente al correo.',
  },
  {
    step: '2',
    icon: Clock,
    title: 'Vigencia máxima de 72 horas',
    desc: 'Por seguridad, el enlace caduca de forma automática si no es aceptado en el plazo.',
  },
  {
    step: '3',
    icon: Lock,
    title: 'Activación y credenciales seguras',
    desc: 'El invitado define su contraseña institucional e inicia el onboarding según su rol.',
  },
]

type Props = {
  embedded?: boolean
  className?: string
}

function SecurityStepsList({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'space-y-2.5' : 'space-y-3.5'}>
      {SECURITY_STEPS.map((item) => {
        const StepIcon = item.icon
        return (
          <div key={item.step} className="flex items-start gap-3">
            <span
              className={cn(
                'flex shrink-0 items-center justify-center rounded-lg border border-border/70',
                compact
                  ? 'size-6 bg-card text-[11px] font-semibold text-foreground'
                  : 'size-7 bg-muted/40 text-xs font-semibold text-foreground'
              )}
            >
              <StepIcon className={compact ? 'size-3 text-muted-foreground' : 'size-3.5 text-muted-foreground'} />
            </span>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-foreground leading-snug">
                {item.title}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CompactStepsList() {
  return (
    <div className="space-y-2">
      {SECURITY_STEPS.map((item) => {
        const StepIcon = item.icon
        return (
          <div key={item.step} className="flex items-center gap-2.5">
            <span
              className={[
                'flex size-5 shrink-0 items-center justify-center rounded-md',
                'border border-border/70 bg-card text-[10px] font-semibold text-foreground',
              ].join(' ')}
            >
              <StepIcon className="size-3 text-muted-foreground" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground leading-snug">
                {item.title}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CompactSecurityStrip({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 sm:p-5 border-t border-border/60 bg-muted/25 space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
          <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-foreground">
            Protocolo de Incorporación
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Auditoría TLS
        </span>
      </div>

      <CompactStepsList />

      <div className="pt-2 border-t border-border/60">
        <p className="text-[10px] text-muted-foreground/80 leading-normal">
          Cifrado TLS en tránsito · Trazabilidad de auditoría registrada en microservicios CIMA.
        </p>
      </div>
    </div>
  )
}

function StandaloneSecurityCard({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        'w-full overflow-hidden rounded-2xl border-border/80 bg-card shadow-md shadow-black/[0.04]',
        className
      )}
    >
      <CardHeader className="border-b bg-muted/20 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4.5 text-primary" aria-hidden="true" />
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
            Protocolo de Incorporación
          </CardTitle>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Garantías de seguridad y trazabilidad aplicadas a cada enlace emitido.
        </p>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        <SecurityStepsList />
        <div className="pt-2 border-t border-border/60">
          <p className="text-[10px] text-muted-foreground/80 leading-normal">
            Cifrado TLS en tránsito · Trazabilidad de auditoría registrada en microservicios CIMA.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/** Tarjeta lateral de gobernanza: muestra el protocolo de seguridad y ciclo de vida de la invitación. */
export function InviteSecurityCard({ embedded = false, className }: Props) {
  if (embedded) {
    return <CompactSecurityStrip className={className} />
  }
  return <StandaloneSecurityCard className={className} />
}

