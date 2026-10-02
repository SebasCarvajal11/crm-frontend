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
    expect(markup).toContain('alt="Foto de perfil de Juan Pérez"')
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
    expect(markup).toContain('bg-emerald-500')
    expect(markup).toContain('aria-label="En línea"')
  })
})
