import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FormField } from '@/components/molecules/form-field'
import { useLoginFlow } from '@/features/auth/hooks'
import {
  loginRequestSchema,
  type LoginRequestValues,
} from '@/features/auth/model'

export type LoginFormValues = LoginRequestValues

function EmailInputSection({
  register,
  id = 'email',
  ...rest
}: {
  register: ReturnType<typeof useForm<LoginFormValues>>['register']
  id?: string
}) {
  return (
    <div className="relative">
      <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type="email"
        autoComplete="email"
        placeholder="ejemplo@cima.com"
        className="h-11 pl-10 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30"
        {...register('email')}
        {...rest}
      />
    </div>
  )
}

function PasswordInputSection({
  register,
  showPassword,
  onTogglePassword,
  id = 'password',
  ...rest
}: {
  register: ReturnType<typeof useForm<LoginFormValues>>['register']
  showPassword: boolean
  onTogglePassword: () => void
  id?: string
}) {
  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={id}
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="••••••••"
        className="h-11 pl-10 pr-10 text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/30"
        {...register('password')}
        {...rest}
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground transition-colors p-1"
        aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
      >
        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const mutation = useLoginFlow()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginRequestSchema),
  })

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
      <FormField id="email" label="Correo" error={errors.email?.message}>
        <EmailInputSection register={register} />
      </FormField>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Contrasena
          </label>
          <Link
            to="/forgot-password"
            className="text-xs text-primary underline-offset-4 hover:underline transition-colors font-medium"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <PasswordInputSection
          register={register}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
        />
        {errors.password?.message ? (
          <p className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      {mutation.isError ? (
        <Alert variant="destructive" className="animate-in fade-in-50 duration-200">
          <AlertTitle className="text-xs font-bold uppercase tracking-wider">Error de acceso</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">{mutation.error.message}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        aria-label="Entrar"
        className="h-11 w-full gap-2 font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-white"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Validando acceso...</span>
          </>
        ) : (
          <>
            <span>Entrar al panel</span>
            <ArrowRight className="size-4 transition-transform group-hover/button:translate-x-0.5" />
          </>
        )}
      </Button>
    </form>
  )
}
