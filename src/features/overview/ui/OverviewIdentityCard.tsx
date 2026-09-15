import { Pencil, UserCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MeResponse } from '@/features/auth/model'

type Props = {
  identity: MeResponse['data']
  avatarUrl?: string | null
  onOpenProfile?: () => void
}

export function OverviewIdentityCard({ identity, avatarUrl, onOpenProfile }: Props) {
  return (
    <Card className="shadow-sm border border-border/80">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar del usuario"
              className="size-16 rounded-full border object-cover shadow-inner"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full border bg-muted">
              <UserCircle2 className="size-9 text-muted-foreground" />
            </div>
          )}
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              aria-label="Editar perfil"
              className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition-all duration-150 hover:scale-110 active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Pencil className="size-3" />
            </button>
          )}
        </div>
        <div className="min-w-0 space-y-1 text-sm">
          <p className="text-base font-bold tracking-tight text-foreground">Tu cuenta</p>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>Email:</span>
            <span className="truncate font-medium text-foreground">{identity.email}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="text-xs text-muted-foreground">Rol:</span>
            <Badge variant="secondary" className="capitalize text-xs font-semibold">
              {identity.role === 'admin' ? 'Administrador' : identity.role === 'worker' ? 'Trabajador' : 'Cliente'}
            </Badge>
          </div>
          {identity.force_password_change ? (
            <p className="text-xs font-medium text-amber-600 dark:text-amber-500">
              Debes cambiar la contraseña por política de seguridad.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
