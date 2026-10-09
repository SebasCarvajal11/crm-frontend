import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OverviewAdminRecentClientsSection } from './OverviewAdminRecentClientsSection'
import { OverviewAdminWorkloadSection } from './OverviewAdminWorkloadSection'
import type { AdminUserRow } from '@/features/admin/model'
import type { WorkerWorkloadItem } from '../model/overview.types'

describe('Overview Halo Clipping Prevention (TDD)', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  const mockClients: AdminUserRow[] = [
    {
      id: 'client-1',
      email: 'acme@client.com',
      company_name: 'Acme Corp',
      first_name: 'John',
      last_name: 'Doe',
      client_kind: 'juridical',
      profession: null,
      role: 'client',
      is_active: true,
      deleted_at: null,
      force_password_change: false,
      created_at: '2026-03-01T10:00:00Z',
    },
  ]

  const mockWorkload: WorkerWorkloadItem[] = [
    {
      workerSub: 'worker-1',
      workerName: 'Carlos Ingeniero',
      workerEmail: 'carlos@cima.com',
      totalAssigned: 5,
      completedCount: 3,
      pendingCount: 2,
      resolutionRate: 60,
    },
  ]

  it('en OverviewAdminRecentClientsSection: no debe recortar el halo del cliente con overflow-hidden en el flex del avatar', () => {
    const markup = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <OverviewAdminRecentClientsSection clients={mockClients} isLoading={false} />
      </QueryClientProvider>
    )

    // Verifica que el avatar del cliente tiene su halo oficial
    expect(markup).toContain('role-halo-client')

    // El contenedor flex inmediato del avatar NO debe tener overflow-hidden para no cortar el halo a la izquierda
    expect(markup).not.toMatch(/class="[^"]*flex items-center gap-2\.5 min-w-0 flex-1 overflow-hidden[^"]*"/)
    expect(markup).toMatch(/class="[^"]*flex items-center gap-2\.5 min-w-0 flex-1[^"]*"/)

    // La fila interactiva tampoco debe recortar las sombras perimetrales
    expect(markup).not.toMatch(/class="[^"]*interactive-row[^"]*overflow-hidden[^"]*"/)

    // El contenedor de texto DEBE conservar overflow-hidden para garantizar truncate responsivo
    expect(markup).toMatch(/class="[^"]*min-w-0 flex-1 space-y-0\.5 overflow-hidden[^"]*"/)
  })

  it('en OverviewAdminWorkloadSection: no debe recortar el halo del trabajador con overflow-hidden en el flex del avatar', () => {
    const markup = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <OverviewAdminWorkloadSection workload={mockWorkload} isLoading={false} />
      </QueryClientProvider>
    )

    // Verifica que el avatar del trabajador tiene su halo oficial
    expect(markup).toContain('role-halo-worker')

    // El contenedor flex inmediato del avatar NO debe tener overflow-hidden
    expect(markup).not.toMatch(/class="[^"]*flex items-center gap-2\.5 min-w-0 flex-1 overflow-hidden[^"]*"/)
    expect(markup).toMatch(/class="[^"]*flex items-center gap-2\.5 min-w-0 flex-1[^"]*"/)

    // El contenedor de texto DEBE conservar overflow-hidden para garantizar truncate responsivo
    expect(markup).toMatch(/class="[^"]*min-w-0 flex-1 overflow-hidden[^"]*"/)
  })
})
