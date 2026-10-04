import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CloudStorageStats } from '@/features/admin/api'
import { calculateStorageSegments } from './storage-segmented-bar-math'
import { StorageSegmentedBar } from './storage-segmented-bar'

const mockCloudStats: CloudStorageStats = {
  quotaBytes: 100_000_000, // 100 MB
  usedBytes: 40_000_000, // 40 MB total used (40%)
  availableBytes: 60_000_000, // 60 MB available (60%)
  usedPercentage: 40,
  totalFilesCount: 15,
  projectFilesCount: 10,
  projectFilesBytes: 25_000_000, // 25 MB (25%)
  avatarsCount: 4,
  avatarsBytes: 10_000_000, // 10 MB (10%)
  documentsCount: 1,
  documentsBytes: 5_000_000, // 5 MB (5%)
}

describe('calculateStorageSegments (Math Helper)', () => {
  it('calcula correctamente los porcentajes proporcionales por categoría', () => {
    const result = calculateStorageSegments(mockCloudStats)
    expect(result.totalUsedPercentage).toBe(40)
    expect(result.quotaBytes).toBe(100_000_000)

    const projects = result.segments.find((s) => s.id === 'projects')
    expect(projects).toBeDefined()
    expect(projects?.percentage).toBe(25)
    expect(projects?.count).toBe(10)

    const avatars = result.segments.find((s) => s.id === 'avatars')
    expect(avatars).toBeDefined()
    expect(avatars?.percentage).toBe(10)

    const documents = result.segments.find((s) => s.id === 'documents')
    expect(documents).toBeDefined()
    expect(documents?.percentage).toBe(5)

    const available = result.segments.find((s) => s.id === 'available')
    expect(available).toBeDefined()
    expect(available?.percentage).toBe(60)
  })

  it('maneja de forma segura cuota cero o sin archivos', () => {
    const emptyStats: CloudStorageStats = {
      quotaBytes: 0,
      usedBytes: 0,
      availableBytes: 0,
      usedPercentage: 0,
      totalFilesCount: 0,
      projectFilesCount: 0,
      projectFilesBytes: 0,
      avatarsCount: 0,
      avatarsBytes: 0,
      documentsCount: 0,
      documentsBytes: 0,
    }
    const result = calculateStorageSegments(emptyStats)
    expect(result.totalUsedPercentage).toBe(0)
    expect(result.segments.length).toBeGreaterThan(0)
  })
})

describe('StorageSegmentedBar (Component Rendering)', () => {
  it('renderiza la barra segmentada con sus segmentos proporcionales y leyenda', () => {
    const markup = renderToStaticMarkup(<StorageSegmentedBar cloud={mockCloudStats} />)

    expect(markup).toContain('data-testid="storage-segmented-bar"')
    expect(markup).toContain('data-testid="storage-segment-projects"')
    expect(markup).toContain('data-testid="storage-segment-avatars"')
    expect(markup).toContain('data-testid="storage-segment-documents"')
    expect(markup).toContain('data-testid="storage-segment-available"')

    expect(markup).toContain('style="width:25%"')
    expect(markup).toContain('style="width:10%"')
    expect(markup).toContain('style="width:5%"')
    expect(markup).toContain('style="width:60%"')

    expect(markup).toContain('data-testid="storage-legend-projects"')
    expect(markup).toContain('data-testid="storage-legend-avatars"')
  })

  it('incluye accesibilidad WAI-ARIA en cada segmento y etiqueta', () => {
    const markup = renderToStaticMarkup(<StorageSegmentedBar cloud={mockCloudStats} />)

    expect(markup).toContain('role="button"')
    expect(markup).toContain('aria-label="Archivos de Proyectos: 23.8 MB (25%)"')
    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('aria-label="Uso detallado de almacenamiento"')
  })
})
