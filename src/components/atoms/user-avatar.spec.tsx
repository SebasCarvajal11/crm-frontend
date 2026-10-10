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
  it('renderiza Texture Atlas sprite del catálogo por defecto para eliminar peticiones N+1', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar src="/avatars/avatar-12.webp" name="Juan Pérez" size="md" />
    )
    expect(markup).toContain('data-testid="user-avatar-sprite"')
    expect(markup).toContain('data-avatar-id="12"')
    expect(markup).toContain('avatars-spritesheet-64.webp')
    expect(markup).toContain('aria-label="Avatar oficial de Juan Pérez"')
    expect(markup).toContain('size-9')
  })

  it('renderiza la etiqueta img tradicional cuando preferSprite es false', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar
        src="/avatars/avatar-12.webp"
        name="Juan Pérez"
        size="md"
        preferSprite={false}
      />
    )
    expect(markup).toContain('src="/avatars/avatar-12.webp"')
    expect(markup).toContain('alt="Avatar oficial de Juan Pérez"')
    expect(markup).toContain('<img')
  })

  it('renderiza la etiqueta img cuando se provee una URL personalizada externa', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar
        src="https://cdn.example.com/custom-profile.jpg"
        name="Juan Pérez"
        size="md"
      />
    )
    expect(markup).toContain('src="https://cdn.example.com/custom-profile.jpg"')
    expect(markup).toContain('<img')
  })

  it('cumple Garantía Cero-Nulos: renderiza avatar oficial en sprite y color corporativo sin iniciales cuando no hay src', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar name="Juan Pérez" userId="123e4567-e89b-12d3-a456-426614174000" size="lg" />
    )
    expect(markup).toContain('size-10')
    expect(markup).toContain('data-testid="user-avatar-sprite"')
    expect(markup).toContain('avatars-spritesheet-64.webp')
    const colorMatch = markup.match(/background-color:\s*(#[0-9a-fA-F]{6})/)
    expect(colorMatch).not.toBeNull()
    const allowedHexes = CIMA_CORPORATE_COLORS.map((c) => c.hex.toLowerCase())
    expect(allowedHexes).toContain(colorMatch![1].toLowerCase())
    expect(markup).not.toContain('JP')
    expect(markup).not.toContain('lucide-user-round')
  })

  it('cumple Garantía Cero-Nulos: renderiza avatar oficial en sprite sin silueta cuando no hay nombre ni src', () => {
    const markup = renderToStaticMarkup(<UserAvatar size="sm" />)
    expect(markup).toContain('size-7')
    expect(markup).toContain('data-testid="user-avatar-sprite"')
    expect(markup).toContain('avatars-spritesheet-64.webp')
    const colorMatch = markup.match(/background-color:\s*(#[0-9a-fA-F]{6})/)
    expect(colorMatch).not.toBeNull()
    const allowedHexes = CIMA_CORPORATE_COLORS.map((c) => c.hex.toLowerCase())
    expect(allowedHexes).toContain(colorMatch![1].toLowerCase())
    expect(markup).not.toContain('lucide-user-round')
  })

  it('aplica color corporativo explícito en estilo de fondo del sprite', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar color="#86070c" avatarId={5} name="Sebas" size="md" />
    )
    expect(markup).toContain('background-color:#86070c')
    expect(markup).toContain('data-avatar-id="5"')
    expect(markup).toContain('data-testid="user-avatar-sprite"')
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
    expect(markup).toContain('data-testid="user-avatar-sprite"')
    expect(markup).toContain('data-avatar-id="21"')
    expect(markup).toContain('aria-label="Avatar oficial de Anderson Giraldo"')
  })

  it('asigna atributos de accesibilidad e interacción cuando es interactivo', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar name="Valeria Quintero" onOpenProfile={() => {}} size="lg" />
    )
    expect(markup).toContain('role="button"')
    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('cursor-pointer')
  })

  it('renderiza srcset y sizes cuando se solicita modo imagen con preferSprite false', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar avatarId={7} name="Carlos CIMA" size="md" preferSprite={false} />
    )
    expect(markup).toContain('srcSet="/avatars/avatar-7-64.webp 64w, /avatars/avatar-7-256.webp 256w, /avatars/avatar-7-512.webp 512w, /avatars/avatar-7-1024.webp 1024w"')
    expect(markup).toContain('sizes="36px"')
  })

  it('asigna sizes de alta densidad en tamaños 2xl en modo imagen tradicional', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar avatarId={12} name="Admin CIMA" size="2xl" preferSprite={false} />
    )
    expect(markup).toContain('sizes="(min-width: 640px) 128px, 112px"')
    expect(markup).toContain('/avatars/avatar-12-1024.webp 1024w')
  })

  it('sanea src vacío o con espacios y recurre limpiamente al avatar determinista en sprite', () => {
    const markupEmpty = renderToStaticMarkup(
      <UserAvatar src="" name="Santiago" size="md" />
    )
    expect(markupEmpty).toContain('data-testid="user-avatar-sprite"')
    expect(markupEmpty).not.toContain('src=""')

    const markupSpaces = renderToStaticMarkup(
      <UserAvatar src="   " name="Santiago" size="md" />
    )
    expect(markupSpaces).toContain('data-testid="user-avatar-sprite"')
  })

  it('controla avatarId fuera de rango recurriendo al avatar determinista de forma segura', () => {
    const markupOutOfBounds = renderToStaticMarkup(
      <UserAvatar avatarId={999} name="Sebas" size="md" />
    )
    expect(markupOutOfBounds).toContain('data-testid="user-avatar-sprite"')
    expect(markupOutOfBounds).not.toContain('data-avatar-id="999"')
  })

  it('garantiza consistencia: genera sprite y color correspondientes al src aunque userId sea arbitrario', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar
        src="/avatars/avatar-31.webp?c=003d52"
        userId="usuario-con-hash-distinto-99"
        name="Valeria Quintero"
        size="md"
      />
    )
    expect(markup).toContain('data-testid="user-avatar-sprite"')
    expect(markup).toContain('data-avatar-id="31"')
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
  })
})
