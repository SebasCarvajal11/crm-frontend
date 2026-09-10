import { Link } from '@tanstack/react-router'
import { ExternalLink, Pencil, UserCircle2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DOCS_ROUTES } from '@/shared/lib/gateway-routes'
import { getApiBaseUrl } from '@/app/session/session-store'
import type { MeResponse } from '@/features/auth/model'

type DashboardOverviewProps = {
  identity: MeResponse['data']
  avatarUrl?: string | null
  onOpenProfile?: () => void
}

/** Deriva un nombre corto para el saludo: nombre real o, si falta, la parte local del correo. */
function displayFirstName(identity: MeResponse['data']) {
  if (identity.first_name) return identity.first_name
  const local = identity.email.split('@')[0] ?? ''
  const cleaned = local.replace(/[._-]+/g, ' ').trim()
  if (!cleaned) return identity.email
  return cleaned
    .split(' ')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ')
}

/** Organismo: resumen de identidad y enlaces útiles (documentación API en gateway). */
export function DashboardOverview({ identity, avatarUrl, onOpenProfile }: DashboardOverviewProps) {
  const docsBase = getApiBaseUrl()
  const firstName = displayFirstName(identity)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-2xl font-medium text-muted-foreground sm:text-3xl">
          Hola <span className="font-black text-primary">{firstName}</span>
        </p>
        <p className="text-2xl font-medium text-muted-foreground sm:text-3xl">
          Bienvenido a{' '}
          <span className="font-black tracking-tight text-foreground">
            CIMA<span className="text-muted-foreground/70">XIS</span>
          </span>
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-md">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar del usuario"
                  className="size-16 rounded-full border object-cover"
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
                  className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
                >
                  <Pencil className="size-3" />
                </button>
              )}
            </div>
            <div className="min-w-0 space-y-1.5 text-sm">
              <p className="text-base font-semibold">Tu cuenta</p>
              <p className="text-xs text-muted-foreground">UUID público (subject)</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="truncate font-medium">{identity.email}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">Rol</span>
                <Badge variant="secondary">{identity.role}</Badge>
              </div>
              {identity.force_password_change ? (
                <p className="text-amber-600 dark:text-amber-500">
                  Debes cambiar la contraseña (política de cuenta).
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documentación</CardTitle>
            <CardDescription>OpenAPI servido por el mismo gateway.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="outline" size="sm" className="justify-between" asChild>
              <a
                href={`${docsBase}${DOCS_ROUTES.swaggerUi}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Abrir Swagger UI en una nueva pestaña"
              >
                Swagger UI
                <ExternalLink className="size-4 opacity-70" />
                <span className="sr-only">(se abre en una nueva pestaña)</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" className="justify-between" asChild>
              <a
                href={`${docsBase}${DOCS_ROUTES.openApiYaml}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Abrir archivo openapi.yaml en una nueva pestaña"
              >
                openapi.yaml
                <ExternalLink className="size-4 opacity-70" />
                <span className="sr-only">(se abre en una nueva pestaña)</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


