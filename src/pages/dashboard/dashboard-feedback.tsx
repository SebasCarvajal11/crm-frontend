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

export function DashboardMissingIdentity({
  onRetry,
  onGoToLogin,
}: {
  onRetry: () => void
  onGoToLogin: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm space-y-4">
        <Alert variant="destructive">
          <AlertTitle>No se pudo cargar tu identidad</AlertTitle>
          <AlertDescription>
            La sesión no trajo información de usuario. Reintenta o vuelve a iniciar sesión.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="w-full" onClick={onRetry}>
          Reintentar
        </Button>
        <Button className="w-full" onClick={onGoToLogin}>
          Ir al login
        </Button>
      </div>
    </div>
  )
}
