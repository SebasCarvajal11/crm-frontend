import { Archive, Pencil, RotateCcw, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/shared/lib/utils'
import type { MarketingPlan } from '../api/plans-api'

interface PlansTableProps {
  plans: MarketingPlan[]
  isBusy?: boolean
  onEdit: (plan: MarketingPlan) => void
  onToggleActive: (plan: MarketingPlan) => void
  onCreate: () => void
}

/** Tabla de planes del catálogo (pestaña Planes, solo admin). */
export function PlansTable({ plans, isBusy, onEdit, onToggleActive, onCreate }: PlansTableProps) {
  if (plans.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-14 text-center">
          <Tag className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="font-medium">Aún no hay planes</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Cree el primer plan para clasificar a los clientes.
          </p>
          <Button className="mt-4" onClick={onCreate}>
            Nuevo plan
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto scroll-smooth scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Descripción</th>
                <th className="px-4 py-3 text-right font-semibold">Clientes</th>
                <th className="px-4 py-3 text-right font-semibold">Orden</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr
                  key={plan.planId}
                  className={cn(
                    'border-b last:border-0 transition-colors duration-150 hover:bg-muted/30',
                    !plan.active && 'text-muted-foreground'
                  )}
                >
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5 font-medium">
                      <span
                        className="size-5 shrink-0 rounded-md border border-black/10 shadow-2xs dark:border-white/15"
                        style={{ backgroundColor: plan.color }}
                        title={plan.color}
                        aria-label={`Color ${plan.color}`}
                      />
                      {plan.name}
                    </span>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">
                    <span className="line-clamp-2">{plan.description || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{plan.clientCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{plan.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                        plan.active
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-border bg-muted text-muted-foreground'
                      )}
                    >
                      {plan.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        disabled={isBusy}
                        onClick={() => onEdit(plan)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        disabled={isBusy}
                        onClick={() => onToggleActive(plan)}
                      >
                        {plan.active ? (
                          <>
                            <Archive className="h-3.5 w-3.5" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reactivar
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
