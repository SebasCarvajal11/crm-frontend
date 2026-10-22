import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { MessageTemplate } from '../api/templates-api'
import { TemplatesTable } from './templates-table'
import { TemplatesExplainer } from './templates-explainer'
import {
  channelForAction,
  channelLabel,
  filterTemplates,
  insertAtCursor,
  templatesForAction,
  validateTemplateForm,
} from './templates.utils'

const tpl = (over: Partial<MessageTemplate>): MessageTemplate => ({
  templateId: 't',
  name: 'Plantilla',
  channel: 'EMAIL',
  plan: null,
  subject: null,
  body: 'Hola {nombre}',
  active: true,
  ...over,
})

const templates: MessageTemplate[] = [
  tpl({ templateId: 't1', name: 'Bienvenida Oro', channel: 'EMAIL', plan: 'Oro', subject: 'Bienvenido {nombre}' }),
  tpl({ templateId: 't2', name: 'Recordatorio', channel: 'WHATSAPP', plan: null, body: 'Hola {nombre}, ¿hablamos?' }),
  tpl({ templateId: 't3', name: 'Aviso interno', channel: 'IN_APP', plan: 'Diamante' }),
  tpl({ templateId: 't4', name: 'Antigua', channel: 'WHATSAPP', active: false }),
]

const noop = () => {}

describe('insertAtCursor', () => {
  it('inserta la variable en la posición del cursor', () => {
    expect(insertAtCursor('Hola , gracias', 5, 5, '{nombre}')).toEqual({
      text: 'Hola {nombre}, gracias',
      cursor: 13,
    })
  })

  it('reemplaza la selección y, sin cursor, agrega al final', () => {
    expect(insertAtCursor('Plan XXX', 5, 8, '{plan}').text).toBe('Plan {plan}')
    expect(insertAtCursor('Hola ', null, null, '{empresa}')).toEqual({ text: 'Hola {empresa}', cursor: 14 })
  })
})

describe('canales y filtros', () => {
  it('relaciona cada acción de automatización con el canal de plantilla', () => {
    expect(channelForAction('send_email')).toBe('EMAIL')
    expect(channelForAction('send_whatsapp')).toBe('WHATSAPP')
    expect(channelForAction('notify_admin')).toBe('IN_APP')
    expect(channelForAction('log_followup')).toBe('IN_APP')
    expect(channelLabel('IN_APP')).toBe('En la aplicación')
  })

  it('para una automatización ofrece solo plantillas activas de su canal', () => {
    expect(templatesForAction(templates, 'send_whatsapp').map((t) => t.templateId)).toEqual(['t2'])
    expect(templatesForAction(templates, 'send_email').map((t) => t.templateId)).toEqual(['t1'])
  })

  it('el filtro por plan incluye las plantillas generales, igual que el backend', () => {
    const oro = filterTemplates(templates, { channel: 'ALL', plan: 'oro' }).map((t) => t.templateId)
    expect(oro).toEqual(['t1', 't2', 't4'])
  })

  it('filtra por canal, busca en el contenido y deja las inactivas al final', () => {
    expect(filterTemplates(templates, { channel: 'WHATSAPP', plan: 'ALL' }).map((t) => t.templateId)).toEqual(['t2', 't4'])
    expect(filterTemplates(templates, { channel: 'ALL', plan: 'ALL', search: 'hablamos' }).map((t) => t.templateId)).toEqual(['t2'])
  })

  it('valida nombre, cuerpo y largo del asunto', () => {
    expect(validateTemplateForm({ name: '', channel: 'EMAIL', subject: 'x'.repeat(201), body: ' ' })).toEqual({
      name: 'El nombre es obligatorio.',
      subject: 'El asunto admite máximo 200 caracteres.',
      body: 'El cuerpo del mensaje es obligatorio.',
    })
    expect(validateTemplateForm({ name: 'Ok', channel: 'WHATSAPP', subject: 'x'.repeat(201), body: 'Hola' })).toEqual({})
  })
})

describe('TemplatesTable', () => {
  const render = (over: Partial<Parameters<typeof TemplatesTable>[0]> = {}) =>
    renderToStaticMarkup(
      <TemplatesTable
        templates={templates}
        onCreate={noop}
        onClearFilters={noop}
        onEdit={noop}
        onPreview={noop}
        onToggleActive={noop}
        {...over}
      />
    )

  it('muestra canal, plan (o "Todos") y estado de cada plantilla', () => {
    const markup = render()
    for (const texto of ['Bienvenida Oro', 'Correo', 'WhatsApp', 'En la aplicación', 'Todos', 'Activa', 'Inactiva', 'Vista previa']) {
      expect(markup).toContain(texto)
    }
    expect(markup).toContain('Bienvenido {nombre} · Hola {nombre}')
  })

  it('sin plantillas ofrece crear una, y con filtro sin resultados ofrece verlas todas', () => {
    expect(render({ templates: [] })).toContain('Aún no hay plantillas')
    const filtrado = render({ templates: [], filtered: true })
    expect(filtrado).toContain('Ninguna plantilla coincide con el filtro')
    expect(filtrado).toContain('Ver todas')
  })
})

describe('TemplatesExplainer', () => {
  it('explica qué es una plantilla con un ejemplo, las variables y dónde se usa', () => {
    const markup = renderToStaticMarkup(<TemplatesExplainer forceOpen />)
    expect(markup).toContain('¿Qué es una plantilla?')
    expect(markup).toContain('Hola Acme SAS, gracias por confiar en el plan Oro.')
    for (const texto of ['{nombre}', '{plan}', '{empresa}', '{workflow}', 'En Automatizaciones', 'Abrir en WhatsApp', 'Cómo crear una']) {
      expect(markup).toContain(texto)
    }
    // Abierta a la fuerza (sin plantillas) no ofrece ocultarla.
    expect(markup).not.toContain('Ocultar')
  })
})
