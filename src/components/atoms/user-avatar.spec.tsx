import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { UserAvatar } from './user-avatar'
import { extractUserInitials } from '@/shared/lib/avatar-utils'
import { CIMA_CORPORATE_COLORS } from '@/shared/lib/avatar-catalog'

describe('extractUserInitials', () => {
  it('extrae iniciales de nombre y apellido correctamente', () => {
    expect(extractUserInitials('Carlos Santana')).toBe('CS')
    expect(extractUserInitials('María José Gómez')).toBe('MG')
    expect(extractUserInitials('Admin')).toBe('AD')
    expect(extractUserInitials('')).toBe('')
    expect(extractUserInitials(null)).toBe('')
  })
})

describe('UserAvatar', () => {
  it('renderiza la imagen cuando se provee src válido', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar src="/avatars/avatar-12.webp" name="Juan Pérez" size="md" />
    )
    expect(markup).toContain('src="/avatars/avatar-12.webp"')
    expect(markup).toContain('alt="Avatar oficial de Juan Pérez"')
    expect(markup).toContain('size-9')
  })

  it('cumple Garantía Cero-Nulos: renderiza avatar oficial y color corporativo sin iniciales cuando no hay src', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar name="Juan Pérez" userId="123e4567-e89b-12d3-a456-426614174000" size="lg" />
    )
    expect(markup).toContain('size-10')
    expect(markup).toContain('<img')
    expect(markup).toMatch(/src="\/avatars\/avatar-\d+\.webp"/)
    const colorMatch = markup.match(/background-color:\s*(#[0-9a-fA-F]{6})/)
    expect(colorMatch).not.toBeNull()
    const allowedHexes = CIMA_CORPORATE_COLORS.map((c) => c.hex.toLowerCase())
    expect(allowedHexes).toContain(colorMatch![1].toLowerCase())
    expect(markup).not.toContain('JP')
    expect(markup).not.toContain('lucide-user-round')
  })

  it('cumple Garantía Cero-Nulos: renderiza avatar oficial y color corporativo sin silueta cuando no hay nombre ni src', () => {
    const markup = renderToStaticMarkup(<UserAvatar size="sm" />)
    expect(markup).toContain('size-7')
    expect(markup).toContain('<img')
    expect(markup).toMatch(/src="\/avatars\/avatar-\d+\.webp"/)
    const colorMatch = markup.match(/background-color:\s*(#[0-9a-fA-F]{6})/)
    expect(colorMatch).not.toBeNull()
    const allowedHexes = CIMA_CORPORATE_COLORS.map((c) => c.hex.toLowerCase())
    expect(allowedHexes).toContain(colorMatch![1].toLowerCase())
    expect(markup).not.toContain('lucide-user-round')
  })

  it('aplica color corporativo explícito en estilo de fondo', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar color="#86070c" avatarId={5} name="Sebas" size="md" />
    )
    expect(markup).toContain('background-color:#86070c')
    expect(markup).toContain('src="/avatars/avatar-5.webp"')
  })

  it('reemplaza color vacío por color corporativo CIMA determinista', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar color="" userId="user-custom-1" size="md" />
    )
    const colorMatch = markup.match(/background-color:\s*(#[0-9a-fA-F]{6})/)
    expect(colorMatch).not.toBeNull()
    const allowedHexes = CIMA_CORPORATE_COLORS.map((c) => c.hex.toLowerCase())
    expect(allowedHexes).toContain(colorMatch![1].toLowerCase())
  })

  it('agrega indicador de presencia en línea', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar name="Ana Silva" presenceStatus="online" size="md" />
    )
    expect(markup).toContain('bg-status-online')
    expect(markup).toContain('aria-label="En línea"')
    expect(markup).toContain('role="status"')
    expect(markup).toContain('z-10')
    expect(markup).toContain('ring-2 ring-background')
  })

  it('agrega indicador de presencia ausente con media luna', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar name="Carlos Mendoza" presenceStatus="away" size="md" />
    )
    expect(markup).toContain('bg-status-away')
    expect(markup).toContain('aria-label="Ausente"')
    expect(markup).toContain('role="status"')
    expect(markup).toContain('<svg')
  })

  it('agrega indicador de ocupado no dependiente de color', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar name="Diana Ruiz" presenceStatus="busy" size="md" />
    )
    expect(markup).toContain('bg-status-busy')
    expect(markup).toContain('aria-label="Ocupado"')
    expect(markup).toContain('role="status"')
  })

  it('agrega indicador de desconectado y reciente con etiquetas accesibles', () => {
    const markupOffline = renderToStaticMarkup(
      <UserAvatar name="Elena Torres" presenceStatus="offline" size="md" />
    )
    expect(markupOffline).toContain('bg-status-offline')
    expect(markupOffline).toContain('aria-label="Desconectado"')
    expect(markupOffline).toContain('role="status"')

    const markupRecent = renderToStaticMarkup(
      <UserAvatar
        name="Felipe Castro"
        presenceStatus="recent"
        presenceLabel="Activo hace 10 min"
        size="md"
      />
    )
    expect(markupRecent).toContain('bg-status-recent')
    expect(markupRecent).toContain('aria-label="Activo hace 10 min"')
    expect(markupRecent).toContain('role="status"')
  })

  it('acepta avatarUrl como alias de src para compatibilidad total', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar avatarUrl="/avatars/avatar-21.webp" name="Anderson Giraldo" size="md" />
    )
    expect(markup).toContain('src="/avatars/avatar-21.webp"')
    expect(markup).toContain('alt="Avatar oficial de Anderson Giraldo"')
  })

  it('asigna atributos de accesibilidad e interacción cuando es interactivo', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar name="Valeria Quintero" onOpenProfile={() => {}} size="lg" />
    )
    expect(markup).toContain('role="button"')
    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('cursor-pointer')
  })

  it('renderiza srcset con resoluciones escalonadas 64w/256w/512w/1024w y sizes responsivo', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar avatarId={7} name="Carlos CIMA" size="md" />
    )
    expect(markup).toContain('srcSet="/avatars/avatar-7-64.webp 64w, /avatars/avatar-7-256.webp 256w, /avatars/avatar-7-512.webp 512w, /avatars/avatar-7-1024.webp 1024w"')
    expect(markup).toContain('sizes="36px"')
  })

  it('asigna sizes de alta densidad en tamaños 2xl para nitidez en pantallas 2K/4K', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar avatarId={12} name="Admin CIMA" size="2xl" />
    )
    expect(markup).toContain('sizes="(min-width: 640px) 128px, 112px"')
    expect(markup).toContain('/avatars/avatar-12-1024.webp 1024w')
  })

  it('sanea src vacío o con espacios y recurre limpiamente al avatar determinista sin warnings', () => {
    const markupEmpty = renderToStaticMarkup(
      <UserAvatar src="" name="Santiago" size="md" />
    )
    expect(markupEmpty).toMatch(/src="\/avatars\/avatar-\d+\.webp"/)
    expect(markupEmpty).not.toContain('src=""')

    const markupSpaces = renderToStaticMarkup(
      <UserAvatar src="   " name="Santiago" size="md" />
    )
    expect(markupSpaces).toMatch(/src="\/avatars\/avatar-\d+\.webp"/)
  })

  it('controla avatarId fuera de rango recurriendo al avatar determinista de forma segura', () => {
    const markupOutOfBounds = renderToStaticMarkup(
      <UserAvatar avatarId={999} name="Sebas" size="md" />
    )
    expect(markupOutOfBounds).toMatch(/src="\/avatars\/avatar-\d+\.webp"/)
    expect(markupOutOfBounds).not.toContain('/avatars/avatar-999.webp')
  })

  it('garantiza consistencia: genera srcset y color correspondientes al src aunque userId sea arbitrario', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar
        src="/avatars/avatar-31.webp?c=003d52"
        userId="usuario-con-hash-distinto-99"
        name="Valeria Quintero"
        size="md"
      />
    )
    expect(markup).toContain('src="/avatars/avatar-31.webp?c=003d52"')
    expect(markup).toContain('/avatars/avatar-31-64.webp 64w')
    expect(markup).toContain('/avatars/avatar-31-1024.webp 1024w')
    expect(markup).toContain('background-color:#003d52')
  })

  it('aplica halo distintivo y animación correspondiente según el rol del usuario', () => {
    const adminMarkup = renderToStaticMarkup(
      <UserAvatar name="Elena" role="admin" size="md" />
    )
    expect(adminMarkup).toContain('role-halo')
    expect(adminMarkup).toContain('role-halo-admin')
    expect(adminMarkup).toContain('role-halo-animated')
    expect(adminMarkup).toContain('data-user-role="admin"')
    expect(adminMarkup).toContain('title="Elena (Administrador)"')

    const workerMarkup = renderToStaticMarkup(
      <UserAvatar name="Carlos" role="worker" size="md" />
    )
    expect(workerMarkup).toContain('role-halo-worker')
    expect(workerMarkup).toContain('data-user-role="worker"')
    expect(workerMarkup).toContain('title="Carlos (Colaborador)"')

    const clientMarkup = renderToStaticMarkup(
      <UserAvatar name="Inversiones SAS" role="client" size="md" />
    )
    expect(clientMarkup).toContain('role-halo-client')
    expect(clientMarkup).toContain('data-user-role="client"')
    expect(clientMarkup).toContain('title="Inversiones SAS (Cliente)"')
  })

  it('permite desactivar animación de halo o excluir el halo explícitamente', () => {
    const staticMarkup = renderToStaticMarkup(
      <UserAvatar name="Juan" role="admin" haloAnimation={false} />
    )
    expect(staticMarkup).toContain('role-halo-admin')
    expect(staticMarkup).not.toContain('role-halo-animated')

    const noHaloMarkup = renderToStaticMarkup(
      <UserAvatar name="Juan" role="admin" showRoleHalo={false} />
    )
    expect(noHaloMarkup).not.toContain('role-halo')
  })

  it('aplica modificadores de escala de halo para tamaños grandes', () => {
    const lgMarkup = renderToStaticMarkup(
      <UserAvatar name="Admin" role="admin" size="lg" />
    )
    expect(lgMarkup).toContain('role-halo-lg')

    const xl2Markup = renderToStaticMarkup(
      <UserAvatar name="Admin" role="admin" size="2xl" />
    )
    expect(xl2Markup).toContain('role-halo-xl')
  })

  it('coexiste limpiamente el halo de rol con el indicador de presencia sin interferencias', () => {
    const mixedMarkup = renderToStaticMarkup(
      <UserAvatar
        name="Diana"
        role="worker"
        presenceStatus="online"
        presenceLabel="Conectada"
      />
    )
    expect(mixedMarkup).toContain('role-halo-worker')
    expect(mixedMarkup).toContain('role="status"')
    expect(mixedMarkup).toContain('aria-label="Conectada"')
    expect(mixedMarkup).toContain('bg-status-online')
  })
})
