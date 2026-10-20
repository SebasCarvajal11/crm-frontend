import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { Campaign } from '../api/marketing-api'
import type { MarketingInteraction } from '../api/interactions-api'
import { planSliceColor } from '@/features/analytics/ui/charts/plan-distribution.utils'
import { DeliveryBadge } from './delivery-badge'
import { deliveryMeta, testEmailResultLabel } from './delivery.utils'
import { EmailQuotaCard } from './email-quota-card'
import { isValidEmail, quotaPercent } from './email-quota.utils'
import { InteractionsTable } from './interactions-table'
import { buildWhatsAppUrl, campaignsForClient } from './whatsapp.utils'

describe('estado de entrega', () => {
  it('traduce cada estado del backend', () => {
    expect(deliveryMeta('QUEUED')?.label).toBe('Enviado (en cola)')
    expect(deliveryMeta('FAILED', 'SMTP 550')).toEqual({ label: 'Falló', tooltip: 'SMTP 550' })
    expect(deliveryMeta('SIMULATED')?.label).toBe('Simulado')
    expect(deliveryMeta('SKIPPED_LIMIT')).toEqual({
      label: 'Límite diario alcanzado',
      tooltip: 'Se reintentará mañana',
    })
    expect(deliveryMeta(null)).toBeNull()
  })

  it('la insignia lleva el error como tooltip y no se muestra sin estado', () => {
    const markup = renderToStaticMarkup(<DeliveryBadge status="FAILED" error="Buzón lleno" />)
    expect(markup).toContain('Falló')
    expect(markup).toContain('title="Buzón lleno"')
    expect(renderToStaticMarkup(<DeliveryBadge status={null} />)).toBe('')
  })

  it('describe el resultado del correo de prueba', () => {
    expect(testEmailResultLabel('QUEUED')).toEqual({ label: 'Correo de prueba enviado (en cola).', ok: true })
    expect(testEmailResultLabel('SKIPPED_LIMIT').ok).toBe(false)
  })
})

describe('InteractionsTable', () => {
  const base: MarketingInteraction = {
    interactionId: 1,
    campaignId: 3,
    clientId: 'c1',
    executionId: 9,
    contactDate: '2026-10-19T10:00:00',
    interactionType: 'message',
    channel: 'email',
    response: null,
  }

  it('muestra la columna Entrega solo con estado y el botón de WhatsApp', () => {
    const markup = renderToStaticMarkup(
      <InteractionsTable
        filtered={[
          { ...base, deliveryStatus: 'SKIPPED_LIMIT' },
          { ...base, interactionId: 2, executionId: null, deliveryStatus: null },
        ]}
        clientLabel={() => 'Acme SAS'}
        onOpenDialog={() => {}}
        onWhatsApp={() => {}}
      />
    )
    expect(markup).toContain('Entrega')
    expect(markup).toContain('Límite diario alcanzado')
    expect(markup).toContain('title="Se reintentará mañana"')
    expect(markup.match(/Abrir en WhatsApp a Acme SAS/g)?.length).toBe(2)
  })
})

describe('cupo de correos', () => {
  it('calcula el porcentaje usado y valida el destinatario', () => {
    expect(quotaPercent({ enabled: true, dailyLimit: 60, sentToday: 12, remaining: 48 })).toBe(20)
    expect(quotaPercent({ enabled: true, dailyLimit: 0, sentToday: 3, remaining: 0 })).toBe(0)
    expect(quotaPercent({ enabled: true, dailyLimit: 10, sentToday: 15, remaining: 0 })).toBe(100)
    expect(isValidEmail('equipo@cima.co')).toBe(true)
    expect(isValidEmail('equipo@cima')).toBe(false)
  })

  it('muestra "Correos hoy: X de Y" y avisa del modo simulado', () => {
    const markup = renderToStaticMarkup(
      <EmailQuotaCard quota={{ enabled: false, dailyLimit: 60, sentToday: 12, remaining: 48 }} />
    )
    expect(markup).toContain('Correos hoy: 12 de 60')
    expect(markup).toContain('Quedan 48')
    expect(markup).toContain('Envío de correos en modo simulado')
  })

  it('una respuesta inválida se muestra como error de consulta', () => {
    const markup = renderToStaticMarkup(<EmailQuotaCard quota={[] as never} />)
    expect(markup).toContain('No se pudo consultar el cupo de correos de hoy.')
    expect(markup).not.toContain('undefined')
  })

  it('con el cupo agotado indica que se reintenta mañana', () => {
    const markup = renderToStaticMarkup(
      <EmailQuotaCard quota={{ enabled: true, dailyLimit: 60, sentToday: 60, remaining: 0 }} />
    )
    expect(markup).toContain('Cupo agotado')
    expect(markup).not.toContain('modo simulado')
  })
})

describe('WhatsApp', () => {
  it('arma el enlace sin número con el mensaje codificado', () => {
    expect(buildWhatsAppUrl(' Hola Ana, ¿cómo va todo? ')).toBe(
      'https://wa.me/?text=Hola%20Ana%2C%20%C2%BFc%C3%B3mo%20va%20todo%3F'
    )
  })

  it('prioriza las campañas del cliente (activas primero) y si no tiene muestra todas', () => {
    const campaign = (id: number, clientId: string, status: Campaign['status']): Campaign => ({
      campaignId: id,
      campaignName: `C${id}`,
      campaignType: 'Reactivation',
      clientId,
      createdBy: 'u',
      startDate: '2026-10-01',
      status,
    })
    const todas = [campaign(1, 'c1', 'Paused'), campaign(2, 'c1', 'Active'), campaign(3, 'c2', 'Active')]
    expect(campaignsForClient(todas, 'c1')).toEqual({ campaigns: [todas[1], todas[0]], ofClient: true })
    expect(campaignsForClient(todas, 'c9').ofClient).toBe(false)
    expect(campaignsForClient(todas, 'c9').campaigns).toHaveLength(3)
  })
})

describe('gráfica de distribución por plan', () => {
  it('usa el color que trae la API y la paleta de respaldo si falta', () => {
    expect(planSliceColor({ plan: 'Esmeralda', clientCount: 2, color: '#10b981' }, 0)).toBe('#10b981')
    expect(planSliceColor({ plan: 'Viejo', clientCount: 1, color: null }, 1)).toBe('#10b981')
    expect(planSliceColor({ plan: '', clientCount: 4 }, 0)).toBe('#cbd5e1')
  })
})
