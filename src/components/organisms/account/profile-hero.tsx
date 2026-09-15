import type { RefObject } from 'react'
import { Camera, CheckCircle2, Clock, Loader2, Mail, Shield, UserCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { MeResponse } from '@/features/auth/model'

type Role = MeResponse['data']['role']

const ROLE_NAMES: Record<Role, string> = {
  admin: 'Administrador',
  worker: 'Trabajador',
  client: 'Cliente',
}

interface ProfileHeroProps {
  identity: MeResponse['data']
  displayName: string
  avatarUrl?: string | null
  isVerified: boolean
  isUploading: boolean
  avatarInputRef: RefObject<HTMLInputElement | null>
  onAvatarFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onOpenPhotoViewer: () => void
}

export function ProfileHero({
  identity,
  displayName,
  avatarUrl,
  isVerified,
  isUploading,
  avatarInputRef,
  onAvatarFileSelect,
  onOpenPhotoViewer,
}: ProfileHeroProps) {
  const roleName = ROLE_NAMES[identity.role] ?? identity.role

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      {/* Banner de marca CIMA con degradado ejecutivo */}
      <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 sm:h-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />
        <div className="absolute -bottom-8 -right-8 size-40 rounded-full bg-white/5 blur-2xl" />
      </div>

      <div className="px-4 pb-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            {/* Solo el avatar se traslapa sobre el banner con margen negativo */}
            <div className="-mt-14 shrink-0 sm:-mt-16">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Opciones de foto de perfil"
                    className="group relative flex size-28 items-center justify-center rounded-full border-4 border-background bg-card shadow-lg ring-1 ring-black/5 transition-all duration-150 hover:scale-[1.03] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:size-32"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar del usuario"
                        className="size-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center rounded-full bg-gradient-to-br from-primary/10 via-primary/5 to-muted text-primary">
                        <UserCircle2 className="size-16 opacity-80" />
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-110">
                      <Camera className="size-3.5" />
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-52">
                  <DropdownMenuItem onClick={onOpenPhotoViewer} disabled={!avatarUrl}>
                    Ver foto
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Cambiar foto de perfil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onAvatarFileSelect}
                disabled={isUploading}
              />
            </div>

            {/* Bloque de identidad en flujo normal sobre fondo de tarjeta */}
            <div className="min-w-0 text-center sm:pt-2 sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {displayName}
                </h2>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground/80">Rol</span>
                  <Badge variant="secondary" className="font-semibold text-xs py-0.5">
                    <Shield className="mr-1 size-3 text-primary" />
                    {roleName}
                  </Badge>
                </div>
              </div>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
                <Mail className="size-3.5 shrink-0 opacity-60" />
                <span className="break-all font-medium text-foreground/80">{identity.email}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 sm:items-end sm:pb-1">
            <Badge
              className={
                isVerified
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
              }
            >
              {isVerified ? (
                <span className="flex items-center gap-1.5 py-0.5 text-xs font-semibold">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  Verificado
                </span>
              ) : (
                <span className="flex items-center gap-1.5 py-0.5 text-xs font-semibold">
                  <Clock className="size-3.5 text-amber-600" />
                  Pendiente de verificacion
                </span>
              )}
            </Badge>

            {isUploading && (
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
                <Loader2 className="size-3 animate-spin text-primary" />
                Subiendo foto...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
