import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Loader2, MailCheck, ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useVerifyEmailFlow } from '@/features/auth/hooks'

type VerifyEmailFormProps = {
  token?: string
}

export function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const navigate = useNavigate()
  const mutation = useVerifyEmailFlow(token)

  if (!token) {
    return (
      <div className="space-y-4 animate-in fade-in-50 duration-200">
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle className="text-xs font-bold uppercase tracking-wider">Enlace no válido</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">
            Falta el token de verificación en la dirección web o ha expirado. Solicita un nuevo
            correo de verificación desde tu cuenta.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="h-11 w-full font-semibold" asChild>
          <Link to="/login">Volver al inicio de sesión</Link>
        </Button>
      </div>
    )
  }

  if (mutation.isSuccess) {
    return (
      <div className="space-y-5 animate-in fade-in-50 duration-200 text-left">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <CheckCircle2 className="size-5 shrink-0" />
            <span>Correo verificado exitosamente</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {mutation.data.message || 'Tu cuenta ha sido validada y está lista para ser utilizada.'}
          </p>
        </div>

        <Button
          className="h-11 w-full gap-2 font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-white"
          onClick={() => navigate({ to: '/login' })}
        >
          <span>Ir al inicio de sesión</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border/80 bg-muted/30 p-4 text-left space-y-2">
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <MailCheck className="size-4 text-primary shrink-0" />
          <span>Confirmación de titularidad</span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Al confirmar, validaremos tu dirección de correo electrónico institucional y activaremos
          todos los permisos de tu perfil en CIMA CRM.
        </p>
      </div>

      {mutation.isError ? (
        <Alert variant="destructive" className="animate-in fade-in-50 duration-200">
          <AlertTitle className="text-xs font-bold uppercase tracking-wider">Error de verificación</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">{mutation.error.message}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="button"
        className="h-11 w-full gap-2 font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-white"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Validando correo...</span>
          </>
        ) : (
          <>
            <span>Confirmar y verificar correo</span>
            <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" />
          </>
        )}
      </Button>
    </div>
  )
}
