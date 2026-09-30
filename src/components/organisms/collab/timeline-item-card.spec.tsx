import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TimelineItemCard } from './timeline-item-card'
import type { ProjectTimelineItem } from '@/features/collab/model'

describe('TimelineItemCard', () => {
  const baseItem: ProjectTimelineItem = {
    id: 'item-1',
    kind: 'file',
    label: 'Archivo',
    title: 'Diseño Final.pdf',
    occurredAt: '2026-03-30T10:00:00.000Z',
    fileId: 'file-123',
    fileName: 'Diseño Final.pdf',
    mimeType: 'application/pdf',
    taskId: null,
    changeRequestId: null,
    createdBySub: 'user-sub-1',
    createdByEmail: 'admin@cimamultimedia.com',
    isClientVisible: true,
  }

  const defaultProps = {
    item: baseItem,
    isLast: false,
    emailBySub: new Map([['user-sub-1', 'admin@cimamultimedia.com']]),
    busyKey: null,
    previewProgress: null,
    onOpenPreview: vi.fn(),
    onDownloadFile: vi.fn(),
  }

  it('renders active preview and download buttons when file is not purged', () => {
    const markup = renderToStaticMarkup(
      <TimelineItemCard {...defaultProps} item={{ ...baseItem, isPurged: false }} />
    )

    expect(markup).toContain('Previsualizar')
    expect(markup).toContain('Descargar')
    expect(markup).not.toContain('Espacio liberado')
    expect(markup).not.toContain('No disponible')
  })

  it('renders purged indicator and hides action buttons when file is purged', () => {
    const markup = renderToStaticMarkup(
      <TimelineItemCard
        {...defaultProps}
        item={{
          ...baseItem,
          isPurged: true,
          purgedReason: 'Optimización de cuota de almacenamiento',
        }}
      />
    )

    expect(markup).toContain('Espacio liberado')
    expect(markup).toContain('No disponible')
    expect(markup).toContain('Archivo depurado')
    expect(markup).toContain('opacity-75 bg-muted/20 border-dashed')
    expect(markup).not.toContain('Previsualizar')
    expect(markup).not.toContain('Descargar')
  })
})
