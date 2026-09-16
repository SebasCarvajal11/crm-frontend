import { Link } from '@tanstack/react-router'
import { AuthSplitLayout } from '@/components/templates/auth-split-layout'
import { VerifyEmailForm } from '@/features/auth/ui'

type Props = { token?: string }

export function VerifyEmailPage({ token }: Props) {
  return (
    <AuthSplitLayout
      title="Verificar correo"
      description="Valida tu dirección de correo electrónico para completar la activación de tu perfil."
      heroTitle="Centro de Innovación Multimedia y Artística"
      heroDescription="Garantizamos la autenticidad y seguridad de cada cuenta corporativa en CIMA CRM."
      features={[
        'Validación Oficial de Titularidad',
        'Activación Total de Privilegios',
        'Notificaciones de Seguridad en Tiempo Real',
      ]}
      badgeText="Verificación de identidad oficial"
      footer={
        <Link
          to="/login"
          className="text-xs text-primary underline-offset-4 hover:underline font-medium transition-colors"
        >
          &larr; Volver al inicio de sesión
        </Link>
      }
    >
      <VerifyEmailForm token={token} />
    </AuthSplitLayout>
  )
}

