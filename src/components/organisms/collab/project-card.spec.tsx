import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { ProjectCard } from './project-card'
import type { ProjectListItem } from '@/features/collab/model'

const sampleProject: ProjectListItem = {
  id: 'proj-1',
  name: 'Campaña Primavera 2026',
  clientName: 'Acme Corp',
  type: 'campaign_service',
  status: 'in_progress',
  progressPercent: 75,
}

describe('ProjectCard', () => {
  it('renderiza información del proyecto y barra de progreso con shimmer', () => {
    const markup = renderToStaticMarkup(
      <ProjectCard project={sampleProject} onClick={vi.fn()} />
    )

    expect(markup).toContain('Campaña Primavera 2026')
    expect(markup).toContain('Acme Corp')
    expect(markup).toContain('75%')
    expect(markup).toContain('animate-progress-shimmer')
    expect(markup).toContain('role="progressbar"')
  })

  it('no inyecta shimmer cuando el progreso es 0%', () => {
    const markup = renderToStaticMarkup(
      <ProjectCard
        project={{ ...sampleProject, progressPercent: 0 }}
        onClick={vi.fn()}
      />
    )

    expect(markup).toContain('0%')
    expect(markup).not.toContain('animate-progress-shimmer')
  })
})
