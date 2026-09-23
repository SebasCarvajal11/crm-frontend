import { Link } from '@tanstack/react-router'
import {
  Briefcase,
  Building2,
  KeyRound,
  Mail,
  MailWarning,
  ShieldCheck,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MeResponse } from '@/features/auth/model'

type Role = MeResponse['data']['role']

const ROLE_NAMES: Record<Role, string> = {
  admin: 'Administrador',
  worker: 'Trabajador',
  client: 'Cliente',
}

interface ProfileDetailsProps {
  identity: MeResponse['data']
  isVerified: boolean
  isSendingVerification: boolean
  onSendVerification: () => void
}

function displayOrFallback(value: string | null | undefined, fallback = 'No registrado') {
  return value?.trim() ? value : fallback
}

interface DetailCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  fullWidth?: boolean
}

function DetailCard({ icon: Icon, label, value, fullWidth = false }: DetailCardProps) {
  return (
    <div
      className={`group flex items-start gap-3 rounded-xl border border-border/70 bg-card/60 p-3.5 transition-colors hover:border-primary/30 hover:bg-card ${
        fullWidth ? 'sm:col-span-2 lg:col-span-2' : ''
      }`}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 break-all text-sm font-medium text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
}

export function ProfileDetails({
  identity,
  isVerified,
  isSendingVerification,
  onSendVerification,
}: ProfileDetailsProps) {
  const roleName = ROLE_NAMES[identity.role] ?? identity.role

  return (
    <div data-tour="account-profile-details" className="space-y-4">
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <DetailCard
          icon={User}
          label="Nombres"
          value={displayOrFallback(identity.first_name)}
        />
        <DetailCard
          icon={User}
          label="Apellidos"
          value={displayOrFallback(identity.last_name)}
        />
        <DetailCard
          icon={Mail}
          label="Correo"
          value={identity.email}
        />
        <DetailCard
          icon={ShieldCheck}
          label="Nivel de acceso"
          value={roleName}
        />

        {identity.role === 'worker' && (
          <DetailCard
            icon={Briefcase}
            label="Profesión"
            value={displayOrFallback(identity.profession)}
            fullWidth
          />
        )}

        {identity.role === 'client' && (
          <>
            {identity.company_name?.trim() ? (
              <DetailCard
                icon={Building2}
                label="Empresa"
                value={identity.company_name}
                fullWidth
              />
            ) : null}
            <DetailCard
              icon={Briefcase}
              label="Tipo de cliente"
              value={displayOrFallback(identity.client_kind)}
              fullWidth
            />
          </>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Banner de Verificación */}
        <div
          className={`flex flex-col justify-between rounded-xl border p-4 transition-colors ${
            isVerified
              ? 'border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
              : 'border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              {isVerified ? (
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <MailWarning className="size-4 text-amber-600 dark:text-amber-400" />
              )}
              <p className="text-sm font-semibold text-foreground">
                Estado de verificación
              </p>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {isVerified
                ? 'Tu cuenta ya cumple el requisito de verificacion de correo.'
                : 'Debes verificar tu correo para completar la seguridad de la cuenta.'}
            </p>
          </div>

          {!isVerified && (
            <Button
              type="button"
              variant="default"
              size="sm"
              className="mt-3 h-9 w-full sm:w-auto"
              disabled={isSendingVerification}
              onClick={onSendVerification}
            >
              {isSendingVerification ? 'Enviando...' : 'Enviar enlace de verificacion'}
            </Button>
          )}
        </div>

        {/* Acceso y Recuperación */}
        <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="size-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Acceso y contraseña
              </p>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Si requieres restablecer tu acceso mediante correo seguro, inicia la recuperación.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="mt-3 h-9 w-full sm:w-auto">
            <Link to="/forgot-password">Recuperar contraseña</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
