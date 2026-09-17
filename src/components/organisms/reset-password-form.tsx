import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FormField } from '@/components/molecules/form-field'
import { useResetPasswordFlow } from '@/features/auth/hooks'
import { strongPasswordSchema } from '@/features/auth/model'

const schema = z
  .object({
    password: strongPasswordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })

type Values = z.infer<typeof schema>

type ResetPasswordFormProps = {
  token: string | undefined
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const mutation = useResetPasswordFlow(token)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  if (!token) {
    return (
      <div className="space-y-4 animate-in fade-in-50 duration-200">
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle className="text-xs font-bold uppercase tracking-wider">Enlace no válido</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">
            Falta el token de seguridad en la dirección web o ha caducado. Solicita un nuevo
            enlace para continuar.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="h-11 w-full font-semibold" asChild>
          <Link to="/forgot-password">Solicitar nuevo enlace</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate({ password: v.password }))} className="space-y-4">
      <FormField id="password" label="Nueva contraseña" error={errors.password?.message}>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="h-11 pl-10 pr-10 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/30 md:text-sm"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground transition-colors p-1"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </FormField>

      <FormField id="confirm" label="Confirmar contraseña" error={errors.confirm?.message}>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            className="h-11 pl-10 pr-10 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30"
            {...register('confirm')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground transition-colors p-1"
            aria-label={showConfirm ? 'Ocultar confirmación' : 'Ver confirmación'}
          >
            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </FormField>

      {mutation.isError ? (
        <Alert variant="destructive" className="animate-in fade-in-50 duration-200">
          <AlertTitle className="text-xs font-bold uppercase tracking-wider">Error al actualizar</AlertTitle>
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
            <span>Guardando nueva contraseña...</span>
          </>
        ) : (
          <>
            <span>Establecer contraseña</span>
            <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  )
}
