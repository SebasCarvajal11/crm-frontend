import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FormField } from '@/components/molecules/form-field'
import { useForgotPasswordFlow } from '@/features/auth/hooks'

const schema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
})

type Values = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const mutation = useForgotPasswordFlow()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  if (mutation.isSuccess) {
    return (
      <div className="space-y-5 animate-in fade-in-50 duration-200">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Solicitud de recuperación enviada</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Si la dirección ingresada está registrada en el sistema, recibirás un correo con las
            instrucciones y el enlace temporal para restablecer tu contraseña.
          </p>
        </div>

        <Button
          variant="outline"
          className="h-11 w-full font-semibold transition-all hover:bg-muted"
          asChild
        >
          <Link to="/login">Volver al inicio de sesión</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
      <FormField id="email" label="Correo institucional" error={errors.email?.message}>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ejemplo@cima.com"
            className="h-11 pl-10 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/30 md:text-sm"
            {...register('email')}
          />
        </div>
      </FormField>

      {mutation.isError ? (
        <Alert variant="destructive" className="animate-in fade-in-50 duration-200">
          <AlertTitle className="text-xs font-bold uppercase tracking-wider">Error de envío</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">{mutation.error.message}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        className="h-11 w-full gap-2 font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-white"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Enviando enlace...</span>
          </>
        ) : (
          <>
            <span>Enviar enlace de recuperación</span>
            <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  )
}
