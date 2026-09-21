import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AuthSplitLayout } from '@/components/templates/auth-split-layout'
import { LoginForm, LegalTermsDialog, type LegalTab } from '@/features/auth/ui'
import { useSessionStore } from '@/app/session/session-store'

export function LoginPage() {
  const token = useSessionStore((s) => s.token)
  const bootstrapped = useSessionStore((s) => s.bootstrapped)
  const navigate = useNavigate({ from: '/login' })
  const [legalModalOpen, setLegalModalOpen] = useState(false)
  const [selectedLegalTab, setSelectedLegalTab] = useState<LegalTab>('terms')

  const openLegalDialog = (tab: LegalTab) => {
    setSelectedLegalTab(tab)
    setLegalModalOpen(true)
  }

  useEffect(() => {
    if (!bootstrapped || !token) return
    navigate({ to: '/dashboard', replace: true })
  }, [bootstrapped, token, navigate])

  if (!bootstrapped || token) return null

  return (
    <>
      <AuthSplitLayout
        title="Iniciar sesión"
        description="Ingresa tus credenciales para acceder a tu espacio de trabajo."
        footer={
          <div className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
            <span>CIMA CRM • Acceso restringido a personal autorizado</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => openLegalDialog('terms')}
                className="underline hover:text-foreground transition-colors cursor-pointer"
              >
                Términos y Condiciones
              </button>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => openLegalDialog('privacy')}
                className="underline hover:text-foreground transition-colors cursor-pointer"
              >
                Política de Privacidad
              </button>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => openLegalDialog('security')}
                className="underline hover:text-foreground transition-colors cursor-pointer"
              >
                Seguridad en la Nube
              </button>
            </div>
          </div>
        }
      >
        <LoginForm />
      </AuthSplitLayout>

      <LegalTermsDialog
        open={legalModalOpen}
        onOpenChange={setLegalModalOpen}
        initialTab={selectedLegalTab}
      />
    </>
  )
}
