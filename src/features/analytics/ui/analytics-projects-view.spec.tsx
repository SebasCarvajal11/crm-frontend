import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { ProjectAnalyticsDto } from '../model'
import { AnalyticsProjectsView, type AnalyticsProjectsViewProps } from './AnalyticsProjectsView'
import { countProjectsByStatus, filterProjects } from './analytics-projects.utils'

const project = (over: Partial<ProjectAnalyticsDto>): ProjectAnalyticsDto => ({
  projectId: 'p',
  name: 'Proyecto',
  status: 'todo',
  clientId: 'c1',
  clientName: 'Acme SAS',
  createdAt: '2026-09-01T10:00:00',
  updatedAt: '2026-10-01T10:00:00',
  approvedProposalsValue: 0,
  ...over,
})

const projects: ProjectAnalyticsDto[] = [
  project({ projectId: 'p1', name: 'Branding Acme', status: 'in_progress', approvedProposalsValue: 2400000 }),
  project({ projectId: 'p2', name: 'Video Beta', status: 'in_review', clientName: 'Beta Ltda', updatedAt: '2026-10-05T08:00:00' }),
  project({ projectId: 'p3', name: 'Web Gamma', status: 'completed', clientName: null }),
  project({ projectId: 'p4', name: 'Fotos Delta', status: 'in_progress' }),
]

function renderView(over: Partial<AnalyticsProjectsViewProps> = {}) {
  const props: AnalyticsProjectsViewProps = {
    projects,
    isLoading: false,
    isError: false,
    statusFilter: 'all',
    onStatusFilterChange: () => {},
    onRetry: () => {},
    isAdmin: false,
    ...over,
  }
  return renderToStaticMarkup(<AnalyticsProjectsView {...props} />)
}

describe('countProjectsByStatus y filterProjects', () => {
  it('cuenta por estado e ignora estados desconocidos', () => {
    expect(countProjectsByStatus([...projects, project({ status: 'archived' })])).toEqual({
      todo: 0,
      in_progress: 2,
      in_review: 1,
      completed: 1,
    })
  })

  it('filtra por estado y ordena por última actualización', () => {
    expect(filterProjects(projects, 'in_progress').map((p) => p.projectId)).toEqual(['p1', 'p4'])
    expect(filterProjects(projects, 'all')[0].projectId).toBe('p2')
  })
})

describe('AnalyticsProjectsView', () => {
  it('muestra el conteo por estado con etiquetas en español', () => {
    const markup = renderView()
    expect(markup).toContain('Proyectos')
    for (const label of ['Todos', 'Por hacer', 'En progreso', 'En revisión', 'Completado']) {
      expect(markup).toContain(label)
    }
  })

  it('lista proyectos con cliente y "Aprobado del cliente"', () => {
    const markup = renderView()
    expect(markup).toContain('Aprobado del cliente')
    expect(markup).toContain('Branding Acme')
    expect(markup).toContain('Beta Ltda')
    expect(markup).toContain('Sin cliente')
    expect(markup).toContain('2.400.000')
  })

  it('aplica el filtro de estado', () => {
    const markup = renderView({ statusFilter: 'completed' })
    expect(markup).toContain('Web Gamma')
    expect(markup).not.toContain('Branding Acme')
    expect(markup).toContain('aria-pressed="true"')
  })

  it('sin proyectos del estado elegido ofrece ver todos', () => {
    const markup = renderView({ statusFilter: 'todo' })
    expect(markup).toContain('Ningún proyecto en estado «Por hacer»')
    expect(markup).toContain('Ver todos')
  })

  it('sin proyectos ofrece sincronizar al admin', () => {
    const markup = renderView({ projects: [], isAdmin: true, onSync: () => {} })
    expect(markup).toContain('Aún no hay proyectos sincronizados')
    expect(markup).toContain('Sincronizar con el CRM')
  })

  it('sin proyectos, a quien no es admin le indica pedirlo a un administrador', () => {
    const markup = renderView({ projects: [], isAdmin: false })
    expect(markup).toContain('Pida a un administrador')
    expect(markup).not.toContain('Sincronizar con el CRM')
  })

  it('muestra carga y error con reintento', () => {
    expect(renderView({ isLoading: true })).toContain('Cargando proyectos')
    const error = renderView({ isError: true })
    expect(error).toContain('No se pudieron cargar los proyectos')
    expect(error).toContain('Reintentar')
  })
})
