import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { RolePrivilegesCard } from './role-privileges-card'
import { InviteSecurityCard } from './invite-security-card'

describe('RolePrivilegesCard', () => {
  it('renderiza la insignia y capacidades de cliente', () => {
    const markup = renderToStaticMarkup(<RolePrivilegesCard role="client" />)
    expect(markup).toContain('Portal Externo')
    expect(markup).toContain('Acceso al Portal de Cliente')
    expect(markup).toContain('Sin acceso a canales de comunicación interna')
  })

  it('renderiza la insignia y capacidades de colaborador', () => {
    const markup = renderToStaticMarkup(<RolePrivilegesCard role="worker" />)
    expect(markup).toContain('Equipo Operativo')
    expect(markup).toContain('Gestión operativa en tablero Kanban')
    expect(markup).toContain('Sin acceso a la consola de gobernanza')
  })

  it('renderiza la insignia y capacidades de administrador', () => {
    const markup = renderToStaticMarkup(<RolePrivilegesCard role="admin" />)
    expect(markup).toContain('Control Total')
    expect(markup).toContain('Control total sobre usuarios')
    expect(markup).toContain('doble factor de autenticación')
  })
})

describe('InviteSecurityCard', () => {
  it('renderiza los pasos del protocolo de seguridad', () => {
    const markup = renderToStaticMarkup(<InviteSecurityCard />)
    expect(markup).toContain('Protocolo de Incorporación')
    expect(markup).toContain('Token criptográfico efímero')
    expect(markup).toContain('Vigencia máxima de 72 horas')
    expect(markup).toContain('Activación y credenciales seguras')
  })
})
