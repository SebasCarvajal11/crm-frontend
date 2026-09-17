import { useState, useMemo } from 'react'
import { Award, ChevronLeft, ChevronRight, FolderCheck, FolderSync, Layers } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { ClientProjectCountItem } from '../model/overview.types'

type Props = {
  items: ClientProjectCountItem[]
  isLoading: boolean
}

const PAGE_SIZE = 5

export function OverviewAdminClientRankingSection({ items, isLoading }: Props) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [items, currentPage])

  return (
    <Card className="shadow-sm border border-border/80 h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Award className="size-4 text-primary" />
            <CardTitle className="text-base font-bold">Ranking de Clientes por Proyectos</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Clientes con mayor volumen histórico y proyectos activos en ejecución.
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-xs font-semibold">
          {items.length} {items.length === 1 ? 'cliente' : 'clientes'}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-between gap-3">
        {isLoading ? (
          <div className="space-y-2.5">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
            <Layers className="size-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">Sin datos de proyectos</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No hay proyectos asociados a clientes registrados todavía.
            </p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 justify-between gap-3">
            <div className="divide-y divide-border/60">
              {pagedItems.map((item, idx) => {
                const rank = (currentPage - 1) * PAGE_SIZE + idx + 1
                return (
                  <div
                    key={item.clientName}
                    className="flex items-center justify-between py-2.5 px-2 rounded-md interactive-row"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {rank}
                      </span>
                      <p className="truncate text-xs font-bold text-foreground">
                        {item.clientName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs shrink-0">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <FolderSync className="size-3.5 text-blue-500" />
                        <span className="font-semibold text-foreground">
                          {item.inProgressProjects}
                        </span>
                        <span className="hidden sm:inline">en curso</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <FolderCheck className="size-3.5 text-emerald-500" />
                        <span className="font-semibold text-foreground">
                          {item.completedProjects}
                        </span>
                        <span className="hidden sm:inline">listos</span>
                      </span>
                      <Badge variant="secondary" className="text-[11px] font-bold">
                        {item.totalProjects} {item.totalProjects === 1 ? 'total' : 'totales'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>

            {totalPages > 1 && (
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
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="size-8 p-0"
                    aria-label="Página siguiente"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
