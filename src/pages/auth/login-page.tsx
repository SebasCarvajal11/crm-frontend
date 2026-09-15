import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AuthSplitLayout } from '@/components/templates/auth-split-layout'
import { LoginForm } from '@/features/auth/ui'
import { useSessionStore } from '@/app/session/session-store'

export function LoginPage() {
  const token = useSessionStore((s) => s.token)
  const bootstrapped = useSessionStore((s) => s.bootstrapped)
  const navigate = useNavigate({ from: '/login' })

  useEffect(() => {
    if (!bootstrapped || !token) return
    navigate({ to: '/dashboard', replace: true })
  }, [bootstrapped, token, navigate])

  if (!bootstrapped || token) return null

  return (
    <AuthSplitLayout
      title="Iniciar sesión"
      description="Ingresa tus credenciales para acceder a tu espacio de trabajo."
      footer={<span>CIMA CRM • Acceso restringido a personal autorizado</span>}
    >
      <LoginForm />
    </AuthSplitLayout>
  )
}
