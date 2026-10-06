import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { UserAvatar } from './user-avatar'
import { extractUserInitials } from '@/shared/lib/avatar-utils'

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
      <UserAvatar src="https://storage.oracle.com/avatar.webp" name="Juan Pérez" size="md" />
    )
    expect(markup).toContain('src="https://storage.oracle.com/avatar.webp"')
    expect(markup).toContain('alt="Avatar oficial de Juan Pérez"')
    expect(markup).toContain('size-9')
  })

  it('renderiza iniciales en fallback cuando no hay src', () => {
    const markup = renderToStaticMarkup(
      <UserAvatar name="Juan Pérez" userId="123e4567-e89b-12d3-a456-426614174000" size="lg" />
    )
    expect(markup).toContain('JP')
    expect(markup).toContain('size-10')
    expect(markup).not.toContain('<img')
  })

  it('renderiza silueta cuando no hay nombre ni src', () => {
    const markup = renderToStaticMarkup(<UserAvatar size="sm" />)
    expect(markup).toContain('lucide-user-round')
    expect(markup).toContain('size-7')
    expect(markup).not.toContain('<img')
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
})
