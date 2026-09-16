import { Link } from '@tanstack/react-router'
import { AuthSplitLayout } from '@/components/templates/auth-split-layout'
import { ForgotPasswordForm } from '@/features/auth/ui'

export function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      title="Recuperar contraseña"
      description="Ingresa tu correo para recibir un enlace de recuperación seguro."
      heroTitle="Centro de Innovación Multimedia y Artística"
      heroDescription="Recupera el acceso a tu espacio de trabajo corporativo mediante verificación cifrada."
      features={[
        'Verificación Cifrada de Identidad',
        'Enlaces Temporales de Un Solo Uso',
        'Protección Total de Credenciales',
      ]}
      badgeText="Protocolo de recuperación seguro"
      footer={
        <Link
          to="/login"
          className="text-xs text-primary underline-offset-4 hover:underline font-medium transition-colors"
        >
          &larr; Volver al inicio de sesión
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthSplitLayout>
  )
}

