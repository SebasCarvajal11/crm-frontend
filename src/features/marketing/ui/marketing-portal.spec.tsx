import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MarketingInteraction } from '../api/interactions-api'
import type { MarketingMessage, MessageThread } from '../api/messages-api'
import type { ClientProposal } from '../api/portal-api'
import type { Proposal } from '../api/proposals-api'
import type { TodayPanel as TodayData } from '../api/commercial-api'
import { ClientProposalCard, ClientProposalDetail, PortalHeader, PortalNotSynced } from './client-portal-parts'
import { ConversationView } from './conversation-view'
import { InteractionsTable } from './interactions-table'
import { ProposalCard } from './proposal-card'
import { TodayPanel } from './today-panel'

const noop = () => {}

const pendiente: ClientProposal = {
  proposalId: 7,
  title: 'Video corporativo',
  description: 'Video corporativo\nIncluye guion y edición',
  value: 1500000,
  status: 'Sent',
  documentUrl: 'https://example.com/p7.pdf',
  createdDate: '2026-10-10',
}

describe('Mi espacio comercial', () => {
  it('encabezado con nombre, plan con su color y los tres contadores', () => {
    const markup = renderToStaticMarkup(
      <PortalHeader
        isLoading={false}
        summary={{ clientName: 'Acme SAS', plan: 'Oro', planColor: '#f59e0b', pendingProposals: 2, unreadMessages: 1, approvedProposals: 3 }}
      />
    )
    expect(markup).toContain('Hola, Acme SAS')
    expect(markup).toContain('Plan Oro')
    expect(markup).toContain('background-color:#f59e0b')
    expect(markup).toContain('Propuestas por decidir')
    expect(markup).toContain('Mensajes sin leer')
  })

  it('tarjeta: título, valor en COP, estado Pendiente y fecha', () => {
    const markup = renderToStaticMarkup(<ClientProposalCard proposal={pendiente} onOpen={noop} />)
    expect(markup).toContain('Video corporativo')
    expect(markup).toMatch(/\$\s1\.500\.000/)
    expect(markup).toContain('data-proposal-state="pending"')
    expect(markup).toContain('Pendiente')
    expect(markup).toContain('Revisar y decidir')
  })

  it('detalle pendiente: descripción completa, documento y botones de decisión', () => {
    const markup = renderToStaticMarkup(<ClientProposalDetail proposal={pendiente} onAccept={noop} onReject={noop} />)
    expect(markup).toContain('Incluye guion y edición')
    expect(markup).toContain('href="https://example.com/p7.pdf"')
    expect(markup).toContain('Aceptar propuesta')
    expect(markup).toContain('Rechazar')
  })

  it('detalle decidido: estado final, comentario y acceso al proyecto creado', () => {
    const markup = renderToStaticMarkup(
      <ClientProposalDetail
        proposal={{ ...pendiente, status: 'Approved', responseDate: '2026-10-16', clientComment: 'Empecemos', projectId: 'proj-1' }}
        notice="Esta propuesta ya no estaba pendiente"
        onAccept={noop}
        onReject={noop}
        onGoToProjects={noop}
      />
    )
    expect(markup).not.toContain('Aceptar propuesta')
    expect(markup).toContain('Aceptaste esta propuesta')
    expect(markup).toContain('Empecemos')
    expect(markup).toContain('Tu proyecto ya fue creado')
    expect(markup).toContain('Ir a mis proyectos')
    expect(markup).toContain('Esta propuesta ya no estaba pendiente')
  })

  it('cuenta no sincronizada', () => {
    expect(renderToStaticMarkup(<PortalNotSynced onRetry={noop} />)).toContain(
      'Tu cuenta aún no está sincronizada con marketing'
    )
  })
})

const mensajes: MarketingMessage[] = [
  { messageId: 'm1', direction: 'OUTBOUND', body: 'Hola, ¿cómo vas?', createdAt: '2026-10-22T09:00:00', readAt: '2026-10-22T09:05:00', authorName: 'Equipo CIMA' },
  { messageId: 'm2', direction: 'INBOUND', body: 'Bien, gracias', createdAt: '2026-10-22T09:10:00', readAt: null, authorName: 'Acme SAS' },
]

describe('ConversationView', () => {
  const render = (perspective: 'client' | 'staff', extra?: React.ReactNode) =>
    renderToStaticMarkup(
      <ConversationView
        messages={mensajes}
        perspective={perspective}
        clientName="Acme SAS"
        isLoading={false}
        isError={false}
        onRetry={noop}
        onSend={async () => true}
        isSending={false}
        emptyTitle="Vacío"
        emptyHint="Escribe"
        placeholder="Escribe tu mensaje para CIMA…"
        composerExtra={extra}
        sendError="Has enviado muchos mensajes"
      />
    )
  it('reutiliza las burbujas del chat: CIMA a la izquierda para el cliente, con lectura', () => {
    const markup = render('client')
    expect(markup).toContain('Hola, ¿cómo vas?')
    expect(markup).toContain('Equipo CIMA · CIMA')
    expect(markup).toContain('data-direction="own"')
    // Su propio mensaje sin leer por CIMA: un solo check.
    expect(markup).toContain('data-seen-state="sent"')
    expect(markup).toContain('0/4.000')
    expect(markup).toContain('Has enviado muchos mensajes')
  })
  it('para CIMA su mensaje leído muestra doble check', () => {
    const markup = render('staff', <span>Enviar también por correo</span>)
    expect(markup).toContain('data-seen-state="fully-seen"')
    expect(markup).toContain('Acme SAS · Cliente')
    expect(markup).toContain('Enviar también por correo')
  })
})

describe('integración con Marketing', () => {
  it('tarjeta de propuesta de CIMA muestra la decisión del cliente', () => {
    const proposal: Proposal = {
      proposalId: 5,
      clientId: 'c1',
      description: 'Plan Oro',
      status: 'Rejected',
      estimatedValue: 1000,
      clientComment: 'El presupuesto no alcanza',
      decidedAt: '2026-10-16T10:00:00',
    }
    const markup = renderToStaticMarkup(
      <ProposalCard proposal={proposal} clientLabel="Acme" onEdit={noop} onChangeStatus={noop} onDelete={noop} isBusy={false} />
    )
    expect(markup).toContain('data-decision="rejected"')
    expect(markup).toContain('Rechazada por el cliente el')
    expect(markup).toContain('El presupuesto no alcanza')
  })

  it('panel Hoy: 4.ª tarjeta "Mensajes sin responder"', () => {
    const data: TodayData = {
      clientsWithoutContact: [],
      proposalsWithoutResponse: [],
      approvedWithoutProject: [],
      counts: { clientsWithoutContact: 0, proposalsWithoutResponse: 0, approvedWithoutProject: 0 },
    }
    const threads: MessageThread[] = [
      { clientId: 'c1', clientName: 'Acme SAS', lastMessage: '¿Tienen disponibilidad?', lastAt: '2026-10-22T08:00:00', lastDirection: 'INBOUND', unread: 2 },
    ]
    const props = { data, isLoading: false, isError: false, plans: [], onRetry: noop, onRegisterContact: noop, onWhatsApp: noop, onViewProposal: noop }
    const markup = renderToStaticMarkup(<TodayPanel {...props} unansweredThreads={threads} onOpenThread={noop} />)
    expect(markup).toContain('data-testid="today-messages"')
    expect(markup).toContain('¿Tienen disponibilidad?')
    expect(markup).toContain('2 mensajes sin leer')
    expect(markup).toContain('Responder')
    expect(markup).toContain('2xl:grid-cols-4')
    expect(renderToStaticMarkup(<TodayPanel {...props} />)).not.toContain('today-messages')
  })

  it('interacciones sin campaña se muestran como "Portal del cliente"', () => {
    const interaccion: MarketingInteraction = {
      interactionId: 1,
      clientId: 'c1',
      campaignId: null,
      executionId: null,
      channel: 'portal',
      interactionType: 'message',
      contactDate: '2026-10-22T08:00:00',
      response: 'Aceptó la propuesta',
    } as unknown as MarketingInteraction
    const markup = renderToStaticMarkup(
      <InteractionsTable filtered={[interaccion]} clientLabel={() => 'Acme'} onOpenDialog={noop} />
    )
    expect(markup).toContain('data-origin="PORTAL"')
    expect(markup.match(/Portal del cliente/g)?.length).toBeGreaterThanOrEqual(2)
  })
})
