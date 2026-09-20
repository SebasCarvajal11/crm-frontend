import { describe, it, expect } from 'vitest'
import {
  TERMS_VERSION,
  TERMS_LAST_UPDATED,
  TERMS_AND_CONDITIONS,
  PRIVACY_POLICY,
  CLOUD_SECURITY_POLICY,
} from './legal-content.constants'

describe('Legal Content Constants (Habeas Data & Compliance)', () => {
  it('defines the official terms version and update date', () => {
    expect(TERMS_VERSION).toBe('2026-v1')
    expect(TERMS_LAST_UPDATED).toContain('2026')
  })

  it('contains mandatory sections for Terms and Conditions', () => {
    expect(TERMS_AND_CONDITIONS.length).toBe(4)
    const titles = TERMS_AND_CONDITIONS.map((s) => s.title)
    expect(titles.some((t) => t.includes('Objeto y Alcance'))).toBe(true)
    expect(titles.some((t) => t.includes('Perfiles de Usuario'))).toBe(true)
    expect(titles.some((t) => t.includes('Propiedad Intelectual'))).toBe(true)
    expect(titles.some((t) => t.includes('Uso Aceptable'))).toBe(true)
  })

  it('complies with Colombian statutory requirements (Ley 1581 and Decreto 1377)', () => {
    expect(PRIVACY_POLICY.length).toBe(3)
    const contentText = PRIVACY_POLICY.flatMap((s) => s.content).join(' ')
    expect(contentText).toContain('Ley 1581 de 2012')
    expect(contentText).toContain('Decreto 1377 de 2013')
    expect(contentText).toContain('Conocer, actualizar y rectificar')
  })

  it('discloses OCI storage architecture and antivirus scanning', () => {
    expect(CLOUD_SECURITY_POLICY.length).toBe(2)
    const contentText = CLOUD_SECURITY_POLICY.flatMap((s) => s.content).join(' ')
    expect(contentText).toContain('Oracle Cloud Infrastructure')
    expect(contentText).toContain('ClamAV')
    expect(contentText).toContain('cuarentena')
  })
})
