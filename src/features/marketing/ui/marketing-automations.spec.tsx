import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Campaign, CreateWorkflowInput, Workflow } from '../api/marketing-api'
import type { MessageTemplate } from '../api/templates-api'
import type { SavedSegment } from '../api/segments-api'
import type { TodayPanel as TodayData } from '../api/commercial-api'
import {
  audienceLabel,
  audienceReach,
  campaignPayload,
  campaignRunsToday,
  validateAudience,
} from './audience.utils'
import { CampaignCard } from './campaign-card'
import { CampaignAudienceFields } from './campaign-form-dialog'
import { DeliveryBadge } from './delivery-badge'
import { SavedSegmentsSection } from './saved-segments-section'
import { criteriaSummary } from './segment-criteria.utils'
import { TodayPanel } from './today-panel'
import { campaignsForClient } from './whatsapp.utils'
import { WorkflowCard } from './workflow-card'
import { WorkflowFormFields } from './workflow-form-dialog'
import { RunNowResultContent, WorkflowPreviewContent } from './workflow-run-dialogs'
import {
  runNowWarning,
  runResultMeta,
  triggerSummary,
  validateWorkflowForm,
  workflowPayload,
} from './workflow.utils'

const noop = () => {}

const base: Campaign = {
  campaignId: 1,
  campaignName: 'Reactivación Oro',
  campaignType: 'Reactivation',
  audienceType: 'SEGMENT',
  clientId: null,
  segmentId: 's1',
  segmentName: 'Oro sin proyecto',
  audienceSize: 8,
  createdBy: 'admin',
  startDate: '2020-01-01',
  endDate: '2099-12-31',
  status: 'Active',
}

describe('audiencia de campañas', () => {
  it('describe la audiencia en la tarjeta', () => {
    expect(audienceLabel(base)).toBe('Segmento: Oro sin proyecto · 8 clientes')
    expect(audienceLabel({ ...base, audienceType: 'ALL', audienceSize: 25 })).toBe('Todos los clientes · 25')
    expect(audienceLabel({ ...base, audienceType: 'CLIENT', clientId: 'c1' }, 'Ana')).toBe('Cliente: Ana')
    // Campañas antiguas sin audienceType: son de un cliente.
    expect(audienceLabel({ ...base, audienceType: null, clientId: 'c1' }, 'Ana')).toBe('Cliente: Ana')
  })
  it('"Le llegará a" con el número de clientes', () => {
    expect(audienceReach(base)).toBe('Segmento Oro sin proyecto · 8 clientes')
    expect(audienceReach({ ...base, audienceType: 'CLIENT', clientId: 'c1' }, 'Ana')).toBe('Ana · 1 cliente')
    expect(audienceReach({ ...base, audienceType: 'ALL', audienceSize: 25 })).toBe('Todos los clientes · 25 clientes')
  })
  it('valida y envía solo el identificador de su audiencia', () => {
    const form = { campaignName: 'X', campaignType: 'Reactivation' as const, startDate: '2026-10-01', status: 'Active' as const }
    expect(validateAudience({ ...form, audienceType: 'CLIENT', clientId: '' })).toMatch(/cliente/)
    expect(validateAudience({ ...form, audienceType: 'SEGMENT', segmentId: null })).toMatch(/segmento/)
    expect(validateAudience({ ...form, audienceType: 'ALL' })).toBeNull()
    expect(campaignPayload({ ...form, audienceType: 'ALL', clientId: 'c1', segmentId: 's1', endDate: '' })).toMatchObject({
      audienceType: 'ALL',
      clientId: null,
      segmentId: null,
      endDate: null,
    })
    expect(campaignPayload({ ...form, clientId: 'c1' })).toMatchObject({ audienceType: 'CLIENT', clientId: 'c1', segmentId: null })
  })
  it('la campaña actúa solo si está activa y dentro de sus fechas', () => {
    const hoy = new Date(2026, 9, 22)
    expect(campaignRunsToday(base, hoy).ok).toBe(true)
    expect(campaignRunsToday({ ...base, status: 'Paused' }, hoy).reason).toMatch(/no está activa/)
    expect(campaignRunsToday({ ...base, endDate: '2026-10-01' }, hoy).reason).toMatch(/ya terminó/)
    expect(campaignRunsToday({ ...base, startDate: '2026-11-01' }, hoy).reason).toMatch(/todavía no empieza/)
  })
  it('tarjeta de campaña con la audiencia', () => {
    const markup = renderToStaticMarkup(<CampaignCard campaign={base} onEdit={noop} onDelete={noop} />)
    expect(markup).toContain('data-audience="SEGMENT"')
    expect(markup).toContain('Segmento: Oro sin proyecto · 8 clientes')
  })
  it('formulario: tres opciones y, con segmento, solo los activos con su número de clientes', () => {
    const segments: SavedSegment[] = [
      { segmentId: 's1', name: 'Oro sin proyecto', criteria: {}, active: true, clientCount: 8 },
      { segmentId: 's2', name: 'Viejo', criteria: {}, active: false, clientCount: 3 },
    ]
    const markup = renderToStaticMarkup(
      <CampaignAudienceFields
        formData={{ campaignName: '', campaignType: 'Reactivation', startDate: '', status: 'Active', audienceType: 'SEGMENT' }}
        clients={[]}
        clientsLoading={false}
        segments={segments}
        segmentsLoading={false}
        onFormDataChange={noop}
      />
    )
    expect(markup).toContain('¿A quién va dirigida?')
    expect(markup).toContain('Un cliente')
    expect(markup).toContain('Un segmento guardado')
    expect(markup).toContain('Todos los clientes')
    expect(markup).toContain('Oro sin proyecto · 8 clientes')
    expect(markup).not.toContain('Viejo')
  })
  it('WhatsApp: también ofrece las campañas cuya audiencia incluye al cliente', () => {
    const otras: Campaign[] = [
      { ...base, campaignId: 1 },
      { ...base, campaignId: 2, audienceType: 'CLIENT', clientId: 'c9' },
    ]
    expect(campaignsForClient(otras, 'c1', new Set([1]))).toEqual({ campaigns: [otras[0]], ofClient: true })
    expect(campaignsForClient(otras, 'c1').ofClient).toBe(false)
  })
})

const wfBase: CreateWorkflowInput = {
  campaignId: 1,
  workflowName: 'Recordatorio',
  triggerType: 'no_contact_x_days',
  noContactDays: 15,
  actionType: 'send_email',
  messageTemplate: 'Hola {nombre}',
}

describe('reglas del formulario de automatización', () => {
  it('noContactDays solo en sin contacto y propuesta sin respuesta; scheduledAt solo en fecha programada', () => {
    expect(workflowPayload({ ...wfBase, triggerType: 'manual' })).not.toHaveProperty('noContactDays')
    expect(workflowPayload({ ...wfBase, triggerType: 'project_completed', scheduledAt: '2026-12-01T09:00:00' })).not.toHaveProperty(
      'scheduledAt'
    )
    expect(workflowPayload({ ...wfBase, triggerType: 'proposal_no_response', noContactDays: 7 }).noContactDays).toBe(7)
    const programada = workflowPayload({ ...wfBase, triggerType: 'scheduled_date', scheduledAt: '2026-12-01T09:00' })
    expect(programada.scheduledAt).toBe('2026-12-01T09:00:00')
    expect(programada).not.toHaveProperty('noContactDays')
    expect(workflowPayload({ ...wfBase, actionType: 'log_followup', templateId: 't1' }).templateId).toBeNull()
  })
  it('la fecha y hora son obligatorias en fecha programada; los días entre 1 y 365', () => {
    expect(validateWorkflowForm({ ...wfBase, triggerType: 'scheduled_date', scheduledAt: null }).scheduledAt).toBeTruthy()
    expect(validateWorkflowForm({ ...wfBase, noContactDays: 0 }).noContactDays).toBeTruthy()
    expect(validateWorkflowForm(wfBase)).toEqual({})
  })
  it('resumen del disparador sin "(15d)" donde no aplica', () => {
    expect(triggerSummary({ triggerType: 'manual', noContactDays: 15 })).toBe('Disparo manual')
    expect(triggerSummary({ triggerType: 'no_contact_x_days', noContactDays: 15 })).toBe('Sin contacto (X días) · 15 días')
    expect(triggerSummary({ triggerType: 'scheduled_date', scheduledAt: '2026-12-01T09:00:00' })).toMatch(
      /^Fecha y hora programada · .*2026/
    )
  })
  it('confirmación de ejecutar ahora: el disparo manual advierte que llega a toda la audiencia', () => {
    expect(runNowWarning('manual')).toMatch(/le llegará otra vez a toda la audiencia/)
    expect(runNowWarning('no_contact_x_days')).toMatch(/mismas reglas/)
  })
})

const templates: MessageTemplate[] = [
  { templateId: 'e1', name: 'Correo Oro', channel: 'EMAIL', body: 'x', active: true },
  { templateId: 'w1', name: 'WhatsApp Oro', channel: 'WHATSAPP', body: 'x', active: true },
  { templateId: 'p1', name: 'Aviso portal', channel: 'IN_APP', body: 'x', active: true },
]

describe('WorkflowFormFields por disparador y acción', () => {
  const render = (form: CreateWorkflowInput, campaigns: Campaign[] = [base]) =>
    renderToStaticMarkup(
      <WorkflowFormFields formData={form} campaigns={campaigns} templates={templates} onFormDataChange={noop} />
    )

  it('fecha y hora programada: selector obligatorio y su ayuda; sin campo de días', () => {
    const markup = render({ ...wfBase, triggerType: 'scheduled_date', noContactDays: null })
    expect(markup).toContain('type="datetime-local"')
    expect(markup).toContain('Se envía una vez cuando llegue esa fecha y hora.')
    expect(markup).not.toContain('id="noContactDays"')
  })
  it('sin contacto y propuesta sin respuesta: campo de días y su ayuda', () => {
    for (const triggerType of ['no_contact_x_days', 'proposal_no_response'] as const) {
      const markup = render({ ...wfBase, triggerType })
      expect(markup).toContain('id="noContactDays"')
      expect(markup).toContain('Se repite como máximo una vez cada X días por cliente.')
      expect(markup).not.toContain('datetime-local')
    }
  })
  it('proyecto finalizado y disparo manual: sin días ni fecha, con su ayuda', () => {
    const fin = render({ ...wfBase, triggerType: 'project_completed', noContactDays: null })
    expect(fin).toContain('Una vez, cuando el cliente termine un proyecto.')
    expect(fin).not.toContain('id="noContactDays"')
    const manual = render({ ...wfBase, triggerType: 'manual', noContactDays: null })
    expect(manual).toContain('Solo corre cuando pulses Ejecutar ahora; cada vez le llega a toda la audiencia.')
  })
  it('la plantilla se filtra por canal y se oculta en seguimiento y notificar', () => {
    const portal = render({ ...wfBase, actionType: 'send_portal_message' })
    expect(portal).toContain('Le llega en Mensajes con CIMA de su portal.')
    expect(portal).toContain('Aviso portal')
    expect(portal).not.toContain('Correo Oro')
    const whatsapp = render({ ...wfBase, actionType: 'send_whatsapp' })
    expect(whatsapp).toContain('Queda en la lista WhatsApp por enviar del panel Hoy.')
    expect(whatsapp).toContain('WhatsApp Oro')
    for (const actionType of ['log_followup', 'notify_admin'] as const) {
      expect(render({ ...wfBase, actionType })).not.toContain('id="wfTemplateId"')
    }
    expect(render({ ...wfBase, actionType: 'log_followup' })).toContain('Nota interna, no le escribe al cliente.')
    expect(render({ ...wfBase, actionType: 'notify_admin' })).toContain('Correo de alerta al buzón de CIMA.')
  })
  it('muestra a quién le llegará y avisa si la campaña no está activa', () => {
    const activa = render(wfBase)
    expect(activa).toContain('Le llegará a: Segmento Oro sin proyecto · 8 clientes')
    expect(activa).not.toContain('workflow-campaign-warning')
    const pausada = render(wfBase, [{ ...base, status: 'Paused' }])
    expect(pausada).toContain('data-testid="workflow-campaign-warning"')
    expect(pausada).toContain('La campaña no está activa')
  })
})

const workflow: Workflow = {
  workflowId: 3,
  campaignId: 1,
  workflowName: 'Fin de año',
  triggerType: 'scheduled_date',
  noContactDays: 15,
  scheduledAt: '2026-12-01T09:00:00',
  actionType: 'send_portal_message',
  active: true,
}

describe('tarjeta de automatización', () => {
  it('fecha programada, audiencia, aviso de campaña inactiva y botones', () => {
    const markup = renderToStaticMarkup(
      <WorkflowCard
        workflow={workflow}
        campaign={{ ...base, status: 'Paused' }}
        isToggling={false}
        isRunning={false}
        onToggle={noop}
        onDelete={noop}
        onRun={noop}
        onViewHistory={noop}
        onPreview={noop}
      />
    )
    expect(markup).not.toContain('(15d)')
    expect(markup).toMatch(/Fecha y hora programada · .*2026/)
    expect(markup).toContain('Le llegará a: Segmento Oro sin proyecto · 8 clientes')
    expect(markup).toContain('data-testid="workflow-card-warning"')
    expect(markup).toContain('Ver a quién le llegaría')
    expect(markup).toContain('Ejecutar ahora')
  })
})

describe('Ver a quién le llegaría y resultado de Ejecutar ahora', () => {
  it('lista "Le llegará" y "No le llegará" con motivo, y la próxima fecha', () => {
    const markup = renderToStaticMarkup(
      <WorkflowPreviewContent
        triggerType="scheduled_date"
        preview={{
          campaignName: 'Reactivación Oro',
          campaignActive: true,
          audienceType: 'SEGMENT',
          audienceSize: 2,
          nextRunAt: '2026-12-01T09:00:00',
          eligible: [{ clientId: 'c1', name: 'Acme SAS', plan: 'Oro' }],
          skipped: [{ clientId: 'c2', name: 'Beta Ltda', reason: 'Ya lo recibió hace 3 días' }],
        }}
      />
    )
    expect(markup).toContain('Le llegará')
    expect(markup).toContain('Acme SAS')
    expect(markup).toContain('No le llegará')
    expect(markup).toContain('Ya lo recibió hace 3 días')
    expect(markup).toContain('data-testid="workflow-next-run"')
    expect(markup).toMatch(/Se enviará el .*2026/)
  })
  it('campaña inactiva: avisa que hoy no le llegaría a nadie', () => {
    const markup = renderToStaticMarkup(
      <WorkflowPreviewContent
        triggerType="manual"
        preview={{ campaignName: 'X', campaignActive: false, audienceType: 'ALL', audienceSize: 0, eligible: [], skipped: [] }}
      />
    )
    expect(markup).toContain('hoy no le llegaría a nadie')
    expect(markup).not.toContain('workflow-next-run')
  })
  it('resultado por cliente en español y omitidos con motivo', () => {
    expect(runResultMeta({ result: 'success', deliveryStatus: 'QUEUED' }, 'send_email').label).toBe('Enviado (en cola)')
    expect(runResultMeta({ result: 'success', deliveryStatus: 'SIMULATED' }, 'send_email').label).toBe('Simulado')
    expect(runResultMeta({ result: 'pending', deliveryStatus: 'SIMULATED' }, 'send_whatsapp').label).toBe('WhatsApp por enviar')
    expect(runResultMeta({ result: 'success', deliveryStatus: null }, 'send_portal_message').label).toBe('En el portal')
    expect(runResultMeta({ result: 'failed', deliveryStatus: 'FAILED' }, 'send_email')).toEqual({ label: 'Falló', tone: 'error' })
    const markup = renderToStaticMarkup(
      <RunNowResultContent
        actionType="send_email"
        result={{
          executed: [
            { clientId: 'c1', name: 'Acme SAS', result: 'success', deliveryStatus: 'QUEUED' },
            { clientId: 'c3', name: 'Gamma', result: 'failed', deliveryStatus: 'FAILED', detail: 'Correo inválido' },
          ],
          skipped: [{ clientId: 'c2', name: 'Beta Ltda', reason: 'Sin correo' }],
        }}
      />
    )
    expect(markup).toContain('Enviado (en cola)')
    expect(markup).toContain('Falló')
    expect(markup).toContain('Correo inválido')
    expect(markup).toContain('Sin correo')
  })
})

describe('segmentos guardados', () => {
  it('resume criterios y muestra número de clientes con sus acciones', () => {
    expect(criteriaSummary({ plans: ['Oro'], hasProjects: false, minDaysWithoutContact: 30 })).toBe(
      'Plan Oro · Sin proyectos · 30+ días sin contacto'
    )
    expect(criteriaSummary({})).toBe('Todos los clientes (sin filtros)')
    const markup = renderToStaticMarkup(
      <SavedSegmentsSection
        segments={[{ segmentId: 's1', name: 'Oro sin proyecto', criteria: { plans: ['Oro'] }, active: true, clientCount: 8 }]}
        isLoading={false}
        isError={false}
        onRetry={noop}
        onViewClients={noop}
        onEdit={noop}
        onToggleActive={noop}
        onLoadCriteria={noop}
        toggleError={{ segmentId: 's1', message: 'La campaña Reactivación Oro lo usa' }}
      />
    )
    expect(markup).toContain('Un segmento guardado puede ser la audiencia de una campaña.')
    expect(markup).toContain('8 clientes')
    expect(markup).toContain('Ver clientes')
    expect(markup).toContain('Editar')
    expect(markup).toContain('Desactivar')
    expect(markup).toContain('La campaña Reactivación Oro lo usa')
  })
})

describe('WhatsApp por enviar', () => {
  const data: TodayData = {
    clientsWithoutContact: [],
    proposalsWithoutResponse: [],
    approvedWithoutProject: [],
    whatsappPending: [
      { interactionId: 9, clientId: 'c1', clientName: 'Acme SAS', message: 'Hola Acme, ¿hablamos?', createdAt: '2026-10-22T08:00:00', workflowName: 'Reactivación' },
    ],
    counts: { clientsWithoutContact: 0, proposalsWithoutResponse: 0, approvedWithoutProject: 0, whatsappPending: 1 },
  }
  const props = { data, isLoading: false, isError: false, plans: [], onRetry: noop, onRegisterContact: noop, onWhatsApp: noop, onViewProposal: noop }
  it('cada mensaje con "Abrir en WhatsApp" (wa.me con el texto) y "Marcar como enviado"', () => {
    const markup = renderToStaticMarkup(<TodayPanel {...props} onMarkWhatsappSent={noop} />)
    expect(markup).toContain('data-testid="today-whatsapp"')
    expect(markup).toContain('Hola Acme, ¿hablamos?')
    expect(markup).toContain('Automatización: Reactivación')
    expect(markup).toContain(`href="https://wa.me/?text=${encodeURIComponent('Hola Acme, ¿hablamos?')}"`)
    expect(markup).toContain('Marcar como enviado')
    expect(renderToStaticMarkup(<TodayPanel {...props} />)).not.toContain('today-whatsapp')
  })
  it('SENT_MANUAL se muestra como "Enviado por WhatsApp"', () => {
    const markup = renderToStaticMarkup(<DeliveryBadge status="SENT_MANUAL" />)
    expect(markup).toContain('Enviado por WhatsApp')
    expect(markup).toContain('data-delivery="SENT_MANUAL"')
  })
})
