import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { ClientTimeline, FunnelResponse, TodayPanel as TodayData } from '../api/commercial-api'
import type { MarketingPlan } from '../api/plans-api'
import type { Proposal } from '../api/proposals-api'
import { Client360Context } from './client360-context'
import { ClientNameButton } from './client-name-button'
import { Client360View } from './client360-view'
import { FunnelView } from './funnel-view'
import { FunnelStageClients } from './funnel-stage-clients'
import { ProposalCard } from './proposal-card'
import { ScoreBar } from './score-bar'
import { TodayPanel } from './today-panel'

const plans: MarketingPlan[] = [
  { planId: 'o', name: 'Oro', color: '#f59e0b', sortOrder: 1, active: true, clientCount: 1 },
]
const noop = () => {}

describe('ScoreBar', () => {
  it('muestra la barra con color por rango y la fórmula en el tooltip', () => {
    const markup = renderToStaticMarkup(<ScoreBar score={80} showLabel />)
    expect(markup).toContain('data-score-level="alto"')
    expect(markup).toContain('aria-valuenow="80"')
    expect(markup).toContain('Interés alto')
    expect(markup).toContain('+30 si respondió en los últimos 30 días')
    expect(markup).toContain('width:80%')
  })
  it('como chip muestra el número con su rango', () => {
    const markup = renderToStaticMarkup(<ScoreBar score={35} variant="chip" />)
    expect(markup).toContain('data-score-level="bajo"')
    expect(markup).toContain('>35<')
  })
})

describe('ClientNameButton', () => {
  it('sin proveedor de ficha es texto; con proveedor es un botón', () => {
    expect(renderToStaticMarkup(<ClientNameButton clientId="c1" name="Acme" />)).toBe('<span>Acme</span>')
    const markup = renderToStaticMarkup(
      <Client360Context.Provider value={{ openClient360: noop }}>
        <ClientNameButton clientId="c1" name="Acme" />
      </Client360Context.Provider>
    )
    expect(markup).toContain('<button')
    expect(markup).toContain('data-client360-link="c1"')
    expect(markup).toContain('Ver ficha 360° del cliente')
  })
})

const funnel: FunnelResponse = {
  period: '2026-10',
  stages: [
    { key: 'clients', label: 'Clientes', count: 12 },
    { key: 'contacted', label: 'Contactados', count: 8 },
    { key: 'responded', label: 'Respondieron', count: 3 },
    { key: 'proposal_sent', label: 'Propuesta enviada', count: 0 },
    { key: 'approved', label: 'Aprobada', count: 2 },
    { key: 'project', label: 'Con proyecto', count: 1 },
  ],
  conversionPercent: [66.67, 37.5, 0, null, 50],
}

describe('FunnelView', () => {
  const render = (over: Partial<Parameters<typeof FunnelView>[0]> = {}) =>
    renderToStaticMarkup(
      <FunnelView
        data={funnel}
        isLoading={false}
        isError={false}
        period="2026-10"
        periodOptions={[{ value: '', label: 'Histórico' }, { value: '2026-10', label: 'Octubre de 2026' }]}
        onPeriodChange={noop}
        onStageClick={noop}
        onRetry={noop}
        {...over}
      />
    )

  it('muestra las seis etapas con su número, la conversión y la ayuda', () => {
    const markup = render()
    for (const etapa of ['Clientes', 'Contactados', 'Respondieron', 'Propuesta enviada', 'Aprobada', 'Con proyecto']) {
      expect(markup).toContain(etapa)
    }
    expect(markup).toContain('66,7 %')
    expect(markup).toContain('—')
    expect(markup).toContain('Clientes que contestaron un mensaje.')
    expect(markup).toContain('Siguiente paso: enviarles una propuesta.')
    expect(markup.match(/data-funnel-conversion=/g)?.length).toBe(5)
    expect(markup).toContain('Histórico')
  })
  it('muestra carga y error con reintento', () => {
    expect(render({ isLoading: true })).toContain('Cargando embudo')
    expect(render({ isError: true })).toContain('No se pudo cargar el embudo')
  })
})

describe('FunnelStageClients', () => {
  it('lista los clientes con plan, último contacto y puntaje', () => {
    const markup = renderToStaticMarkup(
      <FunnelStageClients
        clients={[{ clientId: 'c1', name: 'Acme SAS', plan: 'Oro', lastContact: null, score: 75 }]}
        isLoading={false}
        isError={false}
        plans={plans}
        onRetry={noop}
      />
    )
    expect(markup).toContain('Acme SAS')
    expect(markup).toContain('Último contacto: nunca')
    expect(markup).toContain('data-score-level="alto"')
    expect(markup).toContain('background-color:rgba(245, 158, 11, 0.14)')
  })
  it('sin clientes sugiere otro período', () => {
    const markup = renderToStaticMarkup(
      <FunnelStageClients clients={[]} isLoading={false} isError={false} plans={plans} onRetry={noop} />
    )
    expect(markup).toContain('Ningún cliente en esta etapa')
  })
})

const today: TodayData = {
  clientsWithoutContact: [
    { clientId: 'c2', name: 'Beta Ltda', plan: null, daysSinceContact: null },
    { clientId: 'c3', name: 'Gamma', plan: 'Oro', daysSinceContact: 20 },
  ],
  proposalsWithoutResponse: [
    { proposalId: 7, title: 'Video corporativo', clientId: 'c3', clientName: 'Gamma', daysOpen: 9, value: 1500000 },
  ],
  approvedWithoutProject: [],
  counts: { clientsWithoutContact: 24, proposalsWithoutResponse: 1, approvedWithoutProject: 0 },
}

describe('TodayPanel', () => {
  const render = (over: Partial<Parameters<typeof TodayPanel>[0]> = {}) =>
    renderToStaticMarkup(
      <TodayPanel
        data={today}
        isLoading={false}
        isError={false}
        plans={plans}
        onRetry={noop}
        onRegisterContact={noop}
        onWhatsApp={noop}
        onViewProposal={noop}
        {...over}
      />
    )

  it('muestra los contadores reales, "Nunca contactado", "Hace N días" y "y N más"', () => {
    const markup = render()
    expect(markup).toContain('Nunca contactado')
    expect(markup).toContain('Hace 20 días')
    expect(markup).toContain('aria-label="24 en total"')
    expect(markup).toContain('y 22 más')
    expect(markup).toContain('Registrar contacto')
    expect(markup).toContain('Abrir en WhatsApp a Beta Ltda')
  })
  it('lista propuestas sin respuesta con valor en COP y acción "Ver propuesta"', () => {
    const markup = render()
    expect(markup).toContain('Video corporativo')
    expect(markup).toContain('Abierta hace 9 días')
    expect(markup).toMatch(/\$\s1\.500\.000/)
    expect(markup).toContain('Ver propuesta')
  })
  it('una lista vacía muestra "¡Todo al día!"', () => {
    expect(render()).toContain('¡Todo al día!')
  })
  it('sin permiso de admin, las aprobadas indican que un administrador crea el proyecto', () => {
    const markup = render({
      data: {
        ...today,
        approvedWithoutProject: [{ proposalId: 5, title: 'Plan Oro', clientId: 'c1', clientName: 'Acme', value: 1 }],
        counts: { ...today.counts, approvedWithoutProject: 1 },
      },
    })
    expect(markup).toContain('Un administrador debe crear el proyecto.')
    const admin = render({
      data: {
        ...today,
        approvedWithoutProject: [{ proposalId: 5, title: 'Plan Oro', clientId: 'c1', clientName: 'Acme', value: 1 }],
        counts: { ...today.counts, approvedWithoutProject: 1 },
      },
      renderCreateProject: () => <button>Crear proyecto en Colaboración</button>,
    })
    expect(admin).toContain('Crear proyecto en Colaboración')
  })
})

const timeline: ClientTimeline = {
  client: {
    clientId: 'c1',
    name: 'Acme SAS',
    email: 'acme@example.com',
    plan: 'Oro',
    createdAt: '2026-08-01T09:00:00',
    lastContact: null,
    score: 45,
  },
  stats: { interactions: 4, responses: 2, proposals: 1, approvedValue: 2000000, projects: 0 },
  events: [
    { type: 'RESPONSE', date: '2026-10-15T10:00:00', title: 'El cliente respondió', detail: 'Quiere avanzar', refId: '9' },
    { type: 'PROJECT', date: '2026-10-16T10:00:00', title: 'Proyecto creado', detail: null, refId: 'p1' },
  ],
}

describe('Client360View', () => {
  const render = (over: Partial<Parameters<typeof Client360View>[0]> = {}) =>
    renderToStaticMarkup(
      <Client360View
        data={timeline}
        isLoading={false}
        plans={plans}
        onRegisterContact={noop}
        onWhatsApp={noop}
        onNewProposal={noop}
        {...over}
      />
    )

  it('muestra datos, puntaje medio, estadísticas en COP y la línea de tiempo', () => {
    const markup = render()
    expect(markup).toContain('acme@example.com')
    expect(markup).toContain('Nunca contactado')
    expect(markup).toContain('Interés medio')
    expect(markup).toMatch(/\$\s2\.000\.000/)
    expect(markup).toContain('data-event-type="RESPONSE"')
    expect(markup).toContain('Respuesta')
    expect(markup).toContain('Proyecto creado')
    for (const accion of ['Registrar contacto', 'Abrir en WhatsApp', 'Nueva propuesta']) expect(markup).toContain(accion)
  })
  it('sin "Nueva propuesta" fuera de Marketing y con estados de carga, 404 y error', () => {
    expect(render({ onNewProposal: undefined })).not.toContain('Nueva propuesta')
    expect(render({ isLoading: true })).toContain('Cargando ficha del cliente')
    expect(render({ data: null, notFound: true })).toContain('Este cliente no está en Marketing')
    expect(render({ data: null, isError: true })).toContain('No se pudo cargar la ficha del cliente')
  })
  it('sin eventos invita a registrar el primer contacto', () => {
    expect(render({ data: { ...timeline, events: [] } })).toContain('Registre el primer contacto')
  })
})

describe('ProposalCard con proyecto', () => {
  const base: Proposal = { proposalId: 5, clientId: 'c1', description: 'Plan Oro anual', status: 'Approved', estimatedValue: 2000000 }
  const render = (proposal: Proposal, projectAction?: React.ReactNode) =>
    renderToStaticMarkup(
      <ProposalCard
        proposal={proposal}
        clientLabel="Acme SAS"
        onEdit={noop}
        onChangeStatus={noop}
        onDelete={noop}
        isBusy={false}
        projectAction={projectAction}
        highlighted
      />
    )

  it('muestra "Proyecto vinculado" cuando tiene projectId', () => {
    const markup = render({ ...base, projectId: 'proj-1' }, <button>Crear proyecto en Colaboración</button>)
    expect(markup).toContain('Proyecto vinculado')
    expect(markup).not.toContain('Crear proyecto en Colaboración')
  })
  it('sin proyecto muestra la acción y queda resaltada', () => {
    const markup = render(base, <button>Crear proyecto en Colaboración</button>)
    expect(markup).toContain('Crear proyecto en Colaboración')
    expect(markup).toContain('data-highlighted="true"')
    expect(markup).toContain('id="proposal-5"')
  })
})
