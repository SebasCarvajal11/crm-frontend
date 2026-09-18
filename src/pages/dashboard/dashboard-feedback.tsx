import { isHTTPError } from 'ky'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardRedirecting() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" role="status" aria-live="polite">
      <p className="text-sm text-muted-foreground">Redirigiendo al inicio de sesión…</p>
    </div>
  )
}

export function DashboardBootstrapping() {
  return (
    <div
      className="flex items-center justify-center min-h-screen px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-sm space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <p className="text-sm text-muted-foreground text-center">Comprobando sesión…</p>
      </div>
    </div>
  )
}

export function DashboardLoadError({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) {
  if (isHTTPError(error)) return null
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm space-y-4">
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar tu perfil</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Ocurrió un error inesperado al validar tu sesión.'}
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="w-full" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    </div>
  )
}

export function DashboardMissingIdentity({ onRetry, onGoToLogin }: { onRetry: () => void; onGoToLogin: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" role="alert">
      <Alert className="max-w-md">
        <AlertTitle>Sesión incompleta</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>No se pudo cargar la información del usuario actual.</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={onRetry}>
              Reintentar
            </Button>
            <Button variant="outline" size="sm" onClick={onGoToLogin}>
              Ir a iniciar sesión
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

export function DashboardTabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" role="status" aria-label="Cargando sección">
      <div className="h-9 w-48 rounded-xl bg-muted/60" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-28 rounded-xl bg-muted/40" />
        <div className="h-28 rounded-xl bg-muted/40" />
        <div className="h-28 rounded-xl bg-muted/40" />
        <div className="h-28 rounded-xl bg-muted/40" />
      </div>
      <div className="h-64 rounded-xl bg-muted/30" />
    </div>
  )
}
