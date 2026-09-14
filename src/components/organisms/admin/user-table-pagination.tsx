import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  pageSafe: number
  totalPages: number
  totalItems: number
  pageSize: number
  pageWindow: number[]
  setPage: (updater: (prev: number) => number) => void
}

/** Componente molecular: barra de paginacion compacta del directorio de usuarios. */
export function UserTablePagination({
  pageSafe,
  totalPages,
  totalItems,
  pageSize,
  pageWindow,
  setPage,
}: Props) {
  const from = totalItems === 0 ? 0 : (pageSafe - 1) * pageSize + 1
  const to = Math.min(pageSafe * pageSize, totalItems)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/10 px-4 py-3 sm:px-6">
      <p className="text-xs text-muted-foreground whitespace-nowrap">
        Mostrando <span className="font-semibold text-foreground">{from}</span> a{' '}
        <span className="font-semibold text-foreground">{to}</span> de{' '}
        <span className="font-semibold text-foreground">{totalItems}</span> usuarios
        {totalPages > 1 && (
          <span className="ml-1 text-muted-foreground/80">
            (Pág. {pageSafe}/{totalPages})
          </span>
        )}
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 rounded-lg p-0"
          aria-label="Pagina anterior"
          disabled={pageSafe <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>

        {pageWindow.map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            variant={pageNumber === pageSafe ? 'default' : 'outline'}
            size="sm"
            className="h-8 min-w-8 rounded-lg px-2 text-xs"
            onClick={() => setPage(() => pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-8 rounded-lg p-0"
          aria-label="Pagina siguiente"
          disabled={totalPages === 0 || pageSafe >= totalPages}
          onClick={() =>
            setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p))
          }
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
