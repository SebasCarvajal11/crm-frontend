import { ChevronLeft, ChevronRight, Clock, Globe, LaptopMinimal, LogOut, ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionIntro } from '@/components/molecules/section-intro'
import { useSessionsSection } from '@/features/auth/hooks'

type Props = {
  accessToken: string
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return date.toLocaleString()
}

function sessionTitle(deviceLabel: string) {
  if (/chrome/i.test(deviceLabel)) return 'Google Chrome'
  if (/safari/i.test(deviceLabel)) return 'Apple Safari'
  if (/firefox/i.test(deviceLabel)) return 'Mozilla Firefox'
  if (/edge/i.test(deviceLabel)) return 'Microsoft Edge'
  return deviceLabel.length > 40 ? 'Dispositivo conectado' : deviceLabel
}

export function SessionsSection({ accessToken }: Props) {
  const {
    pageSafe,
    pageSessions,
    pageWindow,
    revokeAllMutation,
    revokeMutation,
    sessions,
    sessionsQ,
    setPage,
    totalPages,
  } = useSessionsSection(accessToken)

  return (
    <section className="flex h-full flex-col space-y-4">
      <SectionIntro
        title="Sesiones activas"
        description="Cierra sesiones en otros dispositivos para proteger tu cuenta."
      />

      <Card className="flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold">Dispositivos conectados</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Revisa y administra los accesos vigentes a tu cuenta.
              </p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LaptopMinimal className="size-4" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-4 sm:p-6">
          {sessionsQ.isLoading ? (
            <div className="space-y-3" role="status" aria-live="polite" aria-busy="true">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : sessionsQ.isError ? (
            <Alert variant="destructive">
              <AlertTitle>No se pudieron cargar las sesiones</AlertTitle>
              <AlertDescription>Intenta recargar la página en unos segundos.</AlertDescription>
            </Alert>
          ) : sessions.length === 0 ? (
            <Alert>
              <AlertTitle>Sin sesiones registradas</AlertTitle>
              <AlertDescription>Cuando inicies sesión en nuevos dispositivos aparecerán aquí.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Página {pageSafe} de {totalPages} • {sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'}
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8 shadow-xs sm:w-auto"
                      disabled={revokeAllMutation.isPending || revokeMutation.isPending}
                      data-tour="account-sessions-revoke-btn"
                    >
                      {revokeAllMutation.isPending
                        ? 'Cerrando sesiones...'
                        : 'Cerrar sesión en todos los dispositivos'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogMedia>
                        <LogOut className="size-6 text-destructive" />
                      </AlertDialogMedia>
                      <AlertDialogTitle>Cerrar sesión en todos los dispositivos</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción cerrará todas tus sesiones activas excepto la actual. Tendrás que volver a ingresar.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => revokeAllMutation.mutate()}
                      >
                        Confirmar cierre global
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {pageSessions.map((session) => (
                <div
                  key={session.family}
                  className={`flex flex-col gap-3 rounded-xl border p-3.5 transition-all sm:flex-row sm:items-center sm:justify-between ${
                    session.is_current
                      ? 'border-primary/40 bg-primary/[0.03] shadow-xs'
                      : 'border-border/70 bg-card hover:border-border'
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${
                        session.is_current
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <LaptopMinimal className="size-4" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {sessionTitle(session.device_label)}
                        </p>
                        {session.is_current && (
                          <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 text-[10px] py-0">
                            <span className="mr-1 size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                            Actual
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 opacity-70" />
                          Última actividad: {formatDateTime(session.last_activity_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="size-3 opacity-70" />
                          Expira: {formatDateTime(session.expires_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground sm:w-auto"
                    aria-label={`Revocar sesión de ${session.device_label}`}
                    disabled={revokeMutation.isPending}
                    onClick={() => revokeMutation.mutate(session.family)}
                  >
                    Revocar
                  </Button>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-1.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={pageSafe <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    <ChevronLeft className="size-3.5" />
                    <span className="sr-only">Anterior</span>
                  </Button>
                  {pageWindow.map((pageNumber) => (
                    <Button
                      key={pageNumber}
                      type="button"
                      variant={pageNumber === pageSafe ? 'default' : 'outline'}
                      size="sm"
                      className="size-8 p-0 text-xs"
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    disabled={pageSafe >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    <ChevronRight className="size-3.5" />
                    <span className="sr-only">Siguiente</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          {revokeMutation.isError && (
            <Alert variant="destructive">
              <AlertTitle>No se pudo revocar la sesión</AlertTitle>
              <AlertDescription>{revokeMutation.error.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-muted/40 p-3 text-xs text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>Cerrar una sesión revoca el acceso de ese navegador sin modificar tu clave principal.</span>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
