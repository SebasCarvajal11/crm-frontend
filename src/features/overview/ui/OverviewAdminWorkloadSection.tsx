import { useMemo, useState } from 'react'
import { CheckCheck, ChevronLeft, ChevronRight, Clock, HardHat, UserX } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { WorkerWorkloadItem } from '../model/overview.types'

type Props = {
  workload: WorkerWorkloadItem[]
  isLoading: boolean
}

const PAGE_SIZE = 3

function WorkloadWorkerCard({ worker }: { worker: WorkerWorkloadItem }) {
  return (
    <div className="rounded-lg border bg-card/60 p-3.5 interactive-card hover:bg-muted/40">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{worker.workerName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{worker.workerEmail}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            Total: {worker.totalAssigned}
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCheck className="size-3.5" />
            {worker.completedCount} hechas
          </span>
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Clock className="size-3.5" />
            {worker.pendingCount} pendientes
          </span>
        </div>
      </div>

      <div className="mt-2.5 space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Tasa de resolución</span>
          <span className="font-semibold text-foreground">{worker.resolutionRate}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${worker.resolutionRate}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function WorkloadEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
      <UserX className="size-8 text-muted-foreground/60 mb-2" />
      <p className="text-sm font-medium text-foreground">Sin tareas asignadas</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Aún no hay colaboradores con tareas asignadas en los proyectos actuales.
      </p>
    </div>
  )
}

function WorkloadPagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: {
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between border-t pt-3 text-xs">
      <span className="text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={onPrev}
          className="size-8 p-0"
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={onNext}
          className="size-8 p-0"
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

export function OverviewAdminWorkloadSection({ workload, isLoading }: Props) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(workload.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const pagedWorkload = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return workload.slice(start, start + PAGE_SIZE)
  }, [workload, currentPage])

  return (
    <Card className="shadow-sm border border-border/80 h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <HardHat className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">Carga de trabajo por trabajador</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Ranking de colaboradores según volumen de tareas asignadas y porcentaje de resolución.
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-xs font-semibold">
          {workload.length} {workload.length === 1 ? 'colaborador' : 'colaboradores'}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-between gap-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : workload.length === 0 ? (
          <WorkloadEmptyState />
        ) : (
          <div className="flex flex-col flex-1 justify-between gap-3">
            <div className="space-y-3">
              {pagedWorkload.map((worker) => (
                <WorkloadWorkerCard key={worker.workerSub} worker={worker} />
              ))}
            </div>

            {totalPages > 1 && (
              <WorkloadPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
