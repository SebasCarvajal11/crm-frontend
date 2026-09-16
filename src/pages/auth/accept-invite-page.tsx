import { Link } from '@tanstack/react-router'
import { AuthSplitLayout } from '@/components/templates/auth-split-layout'
import { AcceptInviteForm } from '@/features/auth/ui'

type Props = { token: string }

export function AcceptInvitePage({ token }: Props) {
  return (
    <AuthSplitLayout
      title="Aceptar invitación"
      description="Configura tu contraseña para activar tu credencial de acceso a CIMA CRM."
      heroTitle="Centro de Innovación Multimedia y Artística"
      heroDescription="Te damos la bienvenida al espacio centralizado de colaboración, gestión y proyectos de CIMA."
      features={[
        'Incorporación Inmediata al Espacio de Trabajo',
        'Acceso a Proyectos, Tareas y Tableros',
        'Canales Seguros de Colaboración',
      ]}
      badgeText="Activación de acceso oficial"
      footer={
        <Link
          to="/login"
          className="text-xs text-primary underline-offset-4 hover:underline font-medium transition-colors"
        >
          ¿Ya tienes cuenta activa? Iniciar sesión &rarr;
        </Link>
      }
    >
      <AcceptInviteForm token={token} />
    </AuthSplitLayout>
  )
}

