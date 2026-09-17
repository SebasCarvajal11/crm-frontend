import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldAlert, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { FormField } from '@/components/molecules/form-field'
import { useAcceptInviteFlow } from '@/features/auth/hooks'
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

type AcceptInviteFormProps = {
  token: string
}

export function AcceptInviteForm({ token }: AcceptInviteFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { previewQuery, mutation } = useAcceptInviteFlow(token)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  if (previewQuery.isPending) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-11 w-full rounded-md" />
        <Skeleton className="h-11 w-full rounded-md" />
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    )
  }

  if (previewQuery.isError) {
    return (
      <div className="space-y-4 animate-in fade-in-50 duration-200">
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle className="text-xs font-bold uppercase tracking-wider">
            Invitación no disponible
          </AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">
            El enlace de invitación es inválido o ha expirado. Comunícate con el administrador
            del sistema para solicitar una nueva invitación.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const preview = previewQuery.data?.data
  const fullName = [preview?.first_name, preview?.last_name].filter(Boolean).join(' ')

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate({ password: v.password }))} className="space-y-4">
      {preview?.email ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-left flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
            <UserCheck className="size-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-xs font-bold text-foreground">
              {fullName || 'Invitación de Usuario'}
            </p>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
              <Mail className="size-3 shrink-0" />
              <span>{preview.email}</span>
            </p>
            {preview.company_name ? (
              <p className="text-[11px] text-muted-foreground font-medium">
                {preview.company_name}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

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
          <AlertTitle className="text-xs font-bold uppercase tracking-wider">Error de activación</AlertTitle>
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
            <span>Activando tu cuenta...</span>
          </>
        ) : (
          <>
            <span>Activar cuenta y acceder</span>
            <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  )
}
