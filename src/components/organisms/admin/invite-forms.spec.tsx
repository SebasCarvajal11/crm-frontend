import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { InviteRoleSwitcher } from './invite-role-switcher'
import { ROLES } from './invite-role-switcher.types'

describe('InviteRoleSwitcher (Sliding Pill Role Conmutador)', () => {
  it('renderiza las 3 opciones de rol con sus atributos data-tour requeridos por el Onboarding Tour', () => {
    const markup = renderToStaticMarkup(
      <InviteRoleSwitcher activeRole="client" onChange={() => {}} />
    )

    expect(markup).toContain('data-tour="admin-invite-client"')
    expect(markup).toContain('data-tour="admin-invite-worker"')
    expect(markup).toContain('data-tour="admin-invite-admin"')

    expect(markup).toContain('data-testid="invite-role-tab-client"')
    expect(markup).toContain('data-testid="invite-role-tab-worker"')
    expect(markup).toContain('data-testid="invite-role-tab-admin"')
  })

  it('renderiza la píldora deslizante GPU con posicionamiento relativo según el rol activo', () => {
    const clientMarkup = renderToStaticMarkup(
      <InviteRoleSwitcher activeRole="client" onChange={() => {}} />
    )
    expect(clientMarkup).toContain('data-testid="invite-role-sliding-pill"')
    expect(clientMarkup).toContain('transform:translateX(0%)')

    const workerMarkup = renderToStaticMarkup(
      <InviteRoleSwitcher activeRole="worker" onChange={() => {}} />
    )
    expect(workerMarkup).toContain('transform:translateX(100%)')

    const adminMarkup = renderToStaticMarkup(
      <InviteRoleSwitcher activeRole="admin" onChange={() => {}} />
    )
    expect(adminMarkup).toContain('transform:translateX(200%)')
  })

  it('asigna atributos WAI-ARIA tablist y tab con estado de selección', () => {
    const markup = renderToStaticMarkup(
      <InviteRoleSwitcher activeRole="worker" onChange={() => {}} />
    )

    expect(markup).toContain('role="tablist"')
    expect(markup).toContain('role="tab"')
    expect(markup).toContain('aria-selected="true"')
    expect(markup).toContain('aria-selected="false"')
  })

  it('mantiene la integridad de metadatos para cada rol corporativo', () => {
    expect(ROLES).toHaveLength(3)
    expect(ROLES[0].id).toBe('client')
    expect(ROLES[1].id).toBe('worker')
    expect(ROLES[2].id).toBe('admin')

    expect(ROLES[0].badgeText).toBe('Portal')
    expect(ROLES[1].badgeText).toBe('Operación')
    expect(ROLES[2].badgeText).toBe('Acceso Total')
  })
})
