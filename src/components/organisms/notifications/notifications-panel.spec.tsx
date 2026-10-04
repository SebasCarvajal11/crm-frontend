import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { NotificationCollapseRow } from './notification-collapse-row'
import { NotificationCard } from './notification-card'
import type { ProjectNotification } from '@/features/collab/model'

const mockNotification: ProjectNotification = {
  id: 'notif-1',
  source: 'mention',
  project_id: 'proj-1',
  project_name: 'Proyecto Alfa',
  channel: 'internal',
  created_at: '2026-10-04T12:00:00Z',
  title: 'Mención de prueba',
  body: 'Hola @admin revisa este entregable de marca',
  resource_type: 'chat_message',
  resource_id: 'res-1',
  message_id: 'msg-1',
  author_sub: 'user-sub-1',
  author_email: 'author@cima.dev',
}

describe('NotificationCollapseRow', () => {
  it('renderiza contenedor con data-dismissing="false" en estado normal', () => {
    const markup = renderToStaticMarkup(
      <NotificationCollapseRow id="notif-1" isDismissing={false}>
        <div data-testid="child-content">Contenido</div>
      </NotificationCollapseRow>
    )

    expect(markup).toContain('class="notification-collapse-row"')
    expect(markup).toContain('data-dismissing="false"')
    expect(markup).toContain('data-notification-id="notif-1"')
    expect(markup).toContain('Contenido')
  })

  it('renderiza contenedor con data-dismissing="true" en descarte activo', () => {
    const markup = renderToStaticMarkup(
      <NotificationCollapseRow id="notif-1" isDismissing={true}>
        <div data-testid="child-content">Contenido</div>
      </NotificationCollapseRow>
    )

    expect(markup).toContain('data-dismissing="true"')
    expect(markup).toContain('class="notification-collapse-inner"')
  })
})

describe('NotificationCard', () => {
  it('renderiza metadatos corporativos, título, cuerpo y badge de mención', () => {
    const markup = renderToStaticMarkup(
      <NotificationCard
        notification={mockNotification}
        isDismissing={false}
        onOpen={vi.fn()}
        onDismiss={vi.fn()}
      />
    )

    expect(markup).toContain('Proyecto Alfa')
    expect(markup).toContain('Mención de prueba')
    expect(markup).toContain('Hola @admin revisa este entregable de marca')
    expect(markup).toContain('Mención en chat')
    expect(markup).toContain('aria-label="Marcar como leída"')
  })

  it('renderiza botón de descarte deshabilitado si está en proceso de colapso', () => {
    const markup = renderToStaticMarkup(
      <NotificationCard
        notification={mockNotification}
        isDismissing={true}
        onOpen={vi.fn()}
        onDismiss={vi.fn()}
      />
    )

    expect(markup).toContain('disabled=""')
    expect(markup).toContain('pointer-events-none')
  })

  it('renderiza badge de actividad interna para canales de equipo', () => {
    const internalNotif: ProjectNotification = {
      ...mockNotification,
      source: 'activity',
      channel: 'internal',
    }

    const markup = renderToStaticMarkup(
      <NotificationCard
        notification={internalNotif}
        isDismissing={false}
        onOpen={vi.fn()}
        onDismiss={vi.fn()}
      />
    )

    expect(markup).toContain('Actividad interna')
  })
})
