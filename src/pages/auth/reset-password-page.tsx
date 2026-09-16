import { Link } from '@tanstack/react-router'
import { AuthSplitLayout } from '@/components/templates/auth-split-layout'
import { ResetPasswordForm } from '@/features/auth/ui'

type Props = { token?: string }

export function ResetPasswordPage({ token }: Props) {
  return (
    <AuthSplitLayout
      title="Nueva contraseña"
      description="Define una contraseña robusta para proteger el acceso a tu cuenta."
      heroTitle="Centro de Innovación Multimedia y Artística"
      heroDescription="Actualiza tus credenciales de acceso bajo estándares avanzados de cifrado y seguridad."
      features={[
        'Cifrado Avanzado de Claves',
        'Validación de Requisitos en Tiempo Real',
        'Actualización Inmediata de Sesión',
      ]}
      badgeText="Seguridad de credenciales CIMA"
      footer={
        <div className="flex items-center justify-center gap-4 text-xs">
          <Link
            to="/login"
            className="text-primary underline-offset-4 hover:underline font-medium transition-colors"
          >
            Iniciar sesión
          </Link>
          <span className="text-border">•</span>
          <Link
            to="/forgot-password"
            className="text-muted-foreground underline-offset-4 hover:underline transition-colors"
          >
            Solicitar otro enlace
          </Link>
        </div>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthSplitLayout>
  )
}

