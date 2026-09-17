import {
  AlertTriangle,
  Briefcase,
  HardHat,
  KeyRound,
  Lock,
  Mail,
  Pencil,
  ShieldCheck,
  UserCircle2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { MeResponse } from '@/features/auth/model'

type Props = {
  identity: MeResponse['data']
  avatarUrl?: string | null
  onOpenProfile?: () => void
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'admin') {
    return (
      <Badge variant="secondary" className="gap-1 text-[11px] font-semibold">
        <ShieldCheck className="size-3 text-primary" />
        Administrador
      </Badge>
    )
  }
  if (role === 'worker') {
    return (
      <Badge variant="secondary" className="gap-1 text-[11px] font-semibold">
        <HardHat className="size-3 text-amber-500" />
        Trabajador
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1 text-[11px] font-semibold">
      <Briefcase className="size-3 text-blue-500" />
      Cliente
    </Badge>
  )
}

function UserAvatar({
  avatarUrl,
  onOpenProfile,
}: {
  avatarUrl?: string | null
  onOpenProfile?: () => void
}) {
  return (
    <div className="relative shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar del usuario"
          className="size-14 rounded-full border object-cover shadow-sm ring-2 ring-primary/20"
        />
      ) : (
        <div className="flex size-14 items-center justify-center rounded-full border bg-muted ring-2 ring-primary/20">
          <UserCircle2 className="size-8 text-muted-foreground" />
        </div>
      )}
      {onOpenProfile && (
        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="Editar perfil"
          className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition-all duration-150 hover:scale-110 active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Pencil className="size-2.5" />
        </button>
      )}
    </div>
  )
}

function AccountContextStats({ role }: { role: string }) {
  const isAdm = role === 'admin'
  const isWrk = role === 'worker'

  const roleTitle = isAdm ? 'Control Total' : isWrk ? 'Gestión Operativa' : 'Portal Clientes'
  const roleDesc = isAdm
    ? 'Supervisión y gestión global'
    : isWrk
      ? 'Proyectos, tareas y colaboración'
      : 'Seguimiento de requerimientos'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <div className="rounded-lg border bg-card/40 p-2.5 transition-colors">
        <div className="flex items-center gap-1.5">
          <KeyRound className="size-3.5 text-primary shrink-0" />
          <p className="text-[11px] font-semibold text-foreground">Nivel de Acceso</p>
        </div>
        <p className="mt-1 text-xs font-bold text-foreground">{roleTitle}</p>
        <p className="text-[11px] text-muted-foreground truncate">{roleDesc}</p>
      </div>

      <div className="rounded-lg border bg-card/40 p-2.5 transition-colors">
        <div className="flex items-center gap-1.5">
          <Lock className="size-3.5 text-emerald-500 shrink-0" />
          <p className="text-[11px] font-semibold text-foreground">Seguridad de Sesión</p>
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <p className="text-xs font-bold text-foreground">Token Seguro (JWT)</p>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">Cifrado activo • HTTPS</p>
      </div>
    </div>
  )
}

function IdentityFooter({ identity }: { identity: MeResponse['data'] }) {
  if (identity.force_password_change) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
        <AlertTriangle className="size-4 shrink-0" />
        <span>Debes cambiar la contraseña por política de seguridad.</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="size-3.5 text-emerald-500" />
        <span>Credenciales verificadas</span>
      </div>
      <span className="font-mono text-[11px] text-muted-foreground/80">
        ID: {identity.id.slice(0, 8)}...
      </span>
    </div>
  )
}

export function OverviewIdentityCard({ identity, avatarUrl, onOpenProfile }: Props) {
  const fullName = [identity.first_name, identity.last_name].filter(Boolean).join(' ')
  const displayName = fullName || identity.email.split('@')[0]

  return (
    <Card className="shadow-sm border border-border/80 h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <UserCircle2 className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">Tu cuenta</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Sesión activa y credenciales de acceso a la plataforma.
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className="text-xs font-semibold border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5"
        >
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Activa
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-between gap-3 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border bg-card/60 p-3.5">
          <div className="flex items-center gap-3.5 min-w-0">
            <UserAvatar avatarUrl={avatarUrl} onOpenProfile={onOpenProfile} />
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
                <RoleBadge role={identity.role} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <Mail className="size-3.5 shrink-0" />
                <span className="truncate">{identity.email}</span>
              </div>
            </div>
          </div>

          {onOpenProfile && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenProfile}
              className="shrink-0 gap-1.5 text-xs font-medium self-start sm:self-center"
            >
              <Pencil className="size-3" />
              <span>Editar perfil</span>
            </Button>
          )}
        </div>

        <AccountContextStats role={identity.role} />

        <IdentityFooter identity={identity} />
      </CardContent>
    </Card>
  )
}
