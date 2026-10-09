import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Dialog } from '@/components/ui/dialog'
import { OnboardingWelcomeContent } from './onboarding-welcome-dialog'

describe('OnboardingWelcomeDialog: Bienvenida y Onboarding Proactivo por Rol', () => {
  it('renderiza la bienvenida personalizada y checklist de inicio para rol cliente', () => {
    const markup = renderToStaticMarkup(
      <Dialog open>
        <OnboardingWelcomeContent
          role="client"
          onStart={() => {}}
          onDismiss={() => {}}
        />
      </Dialog>
    )

    expect(markup).toContain('¡Te damos la bienvenida a CIMA CRM!')
    expect(markup).toContain('portal transparente para aprobar cotizaciones')
    expect(markup).toContain('Tu ruta de inicio recomendada')
    expect(markup).toContain('Aprobaciones y Contratos del Cliente')
    expect(markup).toContain('Comenzar recorrido')
    expect(markup).toContain('Explorar por mi cuenta')
  })

  it('renderiza la bienvenida personalizada y checklist de inicio para rol worker', () => {
    const markup = renderToStaticMarkup(
      <Dialog open>
        <OnboardingWelcomeContent
          role="worker"
          onStart={() => {}}
          onDismiss={() => {}}
        />
      </Dialog>
    )

    expect(markup).toContain('¡Te damos la bienvenida a tu espacio de trabajo!')
    expect(markup).toContain('Gestiona tus tareas asignadas')
    expect(markup).toContain('Tu ruta de inicio recomendada')
    expect(markup).toContain('Flujo de Tareas Operativas')
    expect(markup).toContain('Comenzar recorrido')
    expect(markup).toContain('Explorar por mi cuenta')
  })

  it('renderiza la bienvenida personalizada y checklist de inicio para rol admin', () => {
    const markup = renderToStaticMarkup(
      <Dialog open>
        <OnboardingWelcomeContent
          role="admin"
          onStart={() => {}}
          onDismiss={() => {}}
        />
      </Dialog>
    )

    expect(markup).toContain('¡Te damos la bienvenida a CIMA CRM!')
    expect(markup).toContain('pipeline comercial')
    expect(markup).toContain('Tu ruta de inicio recomendada')
    expect(markup).toContain('Consola de Administracion')
    expect(markup).toContain('Comenzar recorrido')
    expect(markup).toContain('Explorar por mi cuenta')
  })
})
