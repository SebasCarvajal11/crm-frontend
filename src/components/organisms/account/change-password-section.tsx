import { useState } from 'react'
import { Check, KeyRound, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/molecules/form-field'
import { SectionIntro } from '@/components/molecules/section-intro'
import {
  changePasswordSchema,
  type ChangePasswordPayload,
  useChangePasswordFlow,
} from '@/features/auth/hooks'

type Props = {
  accessToken: string
}

export function ChangePasswordSection({ accessToken }: Props) {
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<ChangePasswordPayload | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordPayload>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { old_password: '', new_password: '', confirm: '' },
  })

  const mutation = useChangePasswordFlow(accessToken)

  return (
    <section className="flex h-full flex-col space-y-4">
      <SectionIntro
        title="Seguridad de acceso"
        description="Actualiza tus credenciales periódicamente para mayor protección."
      />

      <Card className="flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold">Nueva contraseña</CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                Mínimo 8 caracteres: mayúscula, minúscula, número y símbolo.
              </CardDescription>
            </div>
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="size-4" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-4 sm:p-6">
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Al actualizar tu clave, se cerrarán los accesos abiertos en otros equipos para proteger tu cuenta.</span>
          </div>

          <form
            className="flex flex-1 flex-col justify-between space-y-4"
            onSubmit={handleSubmit((values) => {
              setPendingPayload(values)
              setConfirmSubmitOpen(true)
            })}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                id="old_password"
                label={
                  <span>
                    Contraseña actual
                    <span className="sr-only">Contrasena actual</span>
                  </span>
                }
                error={errors.old_password?.message}
                className="sm:col-span-2"
              >
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña actual"
                  {...register('old_password')}
                />
              </FormField>

              <FormField
                id="new_password"
                label="Nueva contraseña"
                error={errors.new_password?.message}
              >
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  {...register('new_password')}
                />
              </FormField>

              <FormField
                id="confirm"
                label="Confirmar contraseña"
                error={errors.confirm?.message}
              >
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repite la nueva contraseña"
                  {...register('confirm')}
                />
              </FormField>
            </div>

            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>No se pudo cambiar la contrasena</AlertTitle>
                <AlertDescription>{mutation.error.message}</AlertDescription>
              </Alert>
            )}

            {mutation.isSuccess && (
              <Alert className="border-emerald-200/80 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200">
                <Check className="size-4 text-emerald-600" />
                <AlertTitle>Contrasena actualizada</AlertTitle>
                <AlertDescription>
                  Se cerrará tu sesión en unos segundos para proteger la cuenta.
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                className="h-9 text-xs"
                disabled={mutation.isPending || mutation.isSuccess || !isDirty}
                onClick={() => setConfirmCancelOpen(true)}
              >
                Cancelar cambios
              </Button>
              <Button
                className="h-9 text-xs"
                type="submit"
                disabled={mutation.isPending || mutation.isSuccess}
              >
                {mutation.isPending ? 'Guardando...' : 'Actualizar contrasena'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar actualizacion de contrasena</AlertDialogTitle>
            <AlertDialogDescription>
              Se cerraran tus sesiones activas y tendras que iniciar sesion nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingPayload) return
                mutation.mutate(pendingPayload)
                setPendingPayload(null)
              }}
            >
              Confirmar cambio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar cambios</AlertDialogTitle>
            <AlertDialogDescription>
              Se limpiaran los campos del formulario de seguridad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={() => reset()}>
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
