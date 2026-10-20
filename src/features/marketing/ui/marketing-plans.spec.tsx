import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MarketingClient } from '../api/clients-api'
import type { MarketingPlan } from '../api/plans-api'
import { ClientPlansTable } from './client-plans-table'
import { PlanChip } from './plan-chip'
import { PlansTable } from './plans-table'
import { assignablePlans } from './plans.utils'

const plans: MarketingPlan[] = [
  { planId: 'o', name: 'Oro', color: '#f59e0b', description: 'Pauta y contenido', sortOrder: 1, active: true, clientCount: 2 },
  { planId: 'e', name: 'Esmeralda', color: '#10b981', description: null, sortOrder: 2, active: true, clientCount: 0 },
  { planId: 'b', name: 'Bronce', color: '#a16207', description: null, sortOrder: 3, active: false, clientCount: 1 },
]

const clients: MarketingClient[] = [
  { clientId: 'c1', additionalInfo: 'Acme SAS', contactInfo: 'acme@x.co', plan: 'Oro' },
  { clientId: 'c2', additionalInfo: 'Beta Ltda', contactInfo: 'beta@x.co', plan: 'Bronce' },
  { clientId: 'c3', additionalInfo: 'Gamma', contactInfo: null, plan: null },
]

const noop = () => {}

describe('PlanChip', () => {
  it('usa el color del plan con fondo transparente y borde del mismo color', () => {
    const markup = renderToStaticMarkup(<PlanChip name="Oro" plan={plans[0]} />)
    expect(markup).toContain('Oro')
    expect(markup).toContain('background-color:rgba(245, 158, 11, 0.14)')
    expect(markup).toContain('border-color:rgba(245, 158, 11, 0.85)')
    expect(markup).toContain('text-foreground')
  })

  it('muestra en gris "(inactivo)" un plan inactivo o fuera del catálogo', () => {
    expect(renderToStaticMarkup(<PlanChip name="Bronce" plan={plans[2]} />)).toContain('Bronce (inactivo)')
    const huerfano = renderToStaticMarkup(<PlanChip name="Platinum" plan={null} />)
    expect(huerfano).toContain('Platinum (inactivo)')
    expect(huerfano).toContain('data-inactive="true"')
  })

  it('sin plan muestra "Sin clasificar"', () => {
    expect(renderToStaticMarkup(<PlanChip name={null} />)).toContain('Sin clasificar')
  })
})

describe('ClientPlansTable', () => {
  const render = (withWhatsApp = true) =>
    renderToStaticMarkup(
      <ClientPlansTable
        clients={clients}
        plans={plans}
        activePlans={assignablePlans(plans)}
        isBusy={false}
        onAssignPlan={noop}
        onWhatsApp={withWhatsApp ? noop : undefined}
      />
    )

  it('ofrece en el selector solo los planes activos', () => {
    const markup = render()
    expect(markup).toContain('<option value="Oro">Oro</option>')
    expect(markup).toContain('<option value="Esmeralda">Esmeralda</option>')
    expect(markup).not.toContain('<option value="Bronce">')
  })

  it('un cliente con plan inactivo lo ve en gris y el selector pide cambiarlo', () => {
    const markup = render()
    expect(markup).toContain('Bronce (inactivo)')
    expect(markup).toContain('Cambiar plan…')
  })

  it('muestra el botón de WhatsApp por cliente (con data-tour solo en la primera fila)', () => {
    const markup = render()
    expect(markup.match(/Abrir en WhatsApp/g)?.length).toBe(3)
    expect(markup.match(/data-tour="marketing-whatsapp-btn"/g)?.length).toBe(1)
    expect(render(false)).not.toContain('Abrir en WhatsApp')
  })
})

describe('PlansTable', () => {
  it('lista color, nombre, descripción, clientes, orden y estado', () => {
    const markup = renderToStaticMarkup(
      <PlansTable plans={plans} onEdit={noop} onToggleActive={noop} onCreate={noop} />
    )
    for (const texto of ['Oro', 'Pauta y contenido', 'Esmeralda', 'Activo', 'Inactivo', 'Desactivar', 'Reactivar', 'Editar']) {
      expect(markup).toContain(texto)
    }
    expect(markup).toContain('background-color:#f59e0b')
    expect(markup).not.toContain('Eliminar')
  })

  it('sin planes ofrece crear el primero', () => {
    const markup = renderToStaticMarkup(
      <PlansTable plans={[]} onEdit={noop} onToggleActive={noop} onCreate={noop} />
    )
    expect(markup).toContain('Aún no hay planes')
    expect(markup).toContain('Nuevo plan')
  })
})
