import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { IconButton } from '@/components/ui/icon-button'
import { Skeleton } from '@/components/ui/skeleton'
import { parseApiError } from '@/shared/lib'
import {
  createPlanRequest,
  setPlanActiveRequest,
  updatePlanRequest,
  type MarketingPlan,
  type PlanInput,
} from '../api/plans-api'
import { usePlans } from '../hooks/use-plans'
import { ConfirmActionDialog } from './confirm-action-dialog'
import { PlanFormDialog } from './plan-form-dialog'
import { PlansTable } from './plans-table'
import { planToggleMessage } from './plans.utils'

interface PlansManagerProps {
  accessToken: string
}

/** Pestaña "Planes" (solo admin): catálogo configurable de planes comerciales. */
export function PlansManager({ accessToken }: PlansManagerProps) {
  const queryClient = useQueryClient()
  const { plans, isLoading, isError, refetch } = usePlans(accessToken)
  const [editing, setEditing] = useState<MarketingPlan | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [toggleTarget, setToggleTarget] = useState<MarketingPlan | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['marketing'] })
    void queryClient.invalidateQueries({ queryKey: ['analytics'] })
  }

  const saveMutation = useMutation({
    mutationFn: (input: PlanInput) =>
      editing
        ? updatePlanRequest(accessToken, editing.planId, input)
        : createPlanRequest(accessToken, input),
    onSuccess: (plan) => {
      invalidate()
      setNotice(editing ? `Plan ${plan.name} actualizado.` : `Plan ${plan.name} creado.`)
      cerrarFormulario()
    },
    onError: async (error) => setFormError(await parseApiError(error)),
  })

  const toggleMutation = useMutation({
    mutationFn: (plan: MarketingPlan) => setPlanActiveRequest(accessToken, plan.planId, !plan.active),
    onSuccess: (plan) => {
      invalidate()
      setNotice(plan.active ? `Plan ${plan.name} reactivado.` : `Plan ${plan.name} desactivado.`)
    },
    onError: async (error) => setNotice(`No se pudo cambiar el estado: ${await parseApiError(error)}`),
  })

  function abrirFormulario(plan: MarketingPlan | null) {
    setEditing(plan)
    setFormError(null)
    setFormOpen(true)
  }

  function cerrarFormulario() {
    setFormOpen(false)
    setEditing(null)
    setFormError(null)
  }

  const toggleCopy = toggleTarget ? planToggleMessage(toggleTarget) : null

  return (
    <div className="space-y-5">
      <div
        data-tour="marketing-plans-action"
        className={[
          'flex flex-col gap-3.5 rounded-xl border border-border/70 bg-card p-4.5 shadow-2xs',
          'sm:flex-row sm:items-center sm:justify-between',
        ].join(' ')}
      >
        <div className="flex items-center gap-3">
          <div
            className={[
              'flex size-10 shrink-0 items-center justify-center rounded-xl',
              'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xs',
            ].join(' ')}
          >
            <Tag className="size-5" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base font-bold tracking-tight text-foreground">Planes comerciales</h2>
            <p className="text-xs text-muted-foreground">
              Cree, edite y desactive planes. Un plan no se borra: se desactiva y los clientes lo conservan.
            </p>
          </div>
        </div>
        <Button
          className="h-9 shrink-0 gap-2 rounded-lg font-semibold shadow-2xs"
          onClick={() => abrirFormulario(null)}
          data-tour="marketing-new-plan-btn"
        >
          <Plus className="size-4" />
          Nuevo plan
        </Button>
      </div>

      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <span>{notice}</span>
          <IconButton label="Cerrar aviso" onClick={() => setNotice(null)}>
            <XCircle className="h-4 w-4" />
          </IconButton>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : isError ? (
        <Card className="border-destructive/40">
          <CardContent className="py-10 text-center">
            <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <p className="font-medium">No se pudieron cargar los planes</p>
            <Button variant="outline" className="mt-4" onClick={refetch}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <PlansTable
          plans={plans}
          isBusy={toggleMutation.isPending}
          onEdit={(plan) => abrirFormulario(plan)}
          onToggleActive={(plan) => setToggleTarget(plan)}
          onCreate={() => abrirFormulario(null)}
        />
      )}

      <PlanFormDialog
        open={formOpen}
        plan={editing}
        plans={plans}
        isPending={saveMutation.isPending}
        serverError={formError}
        onClose={cerrarFormulario}
        onSubmit={(input) => {
          setFormError(null)
          saveMutation.mutate(input)
        }}
      />

      <ConfirmActionDialog
        open={toggleTarget !== null}
        title={toggleCopy?.title ?? ''}
        description={toggleCopy?.description ?? ''}
        confirmLabel={toggleCopy?.confirmLabel ?? ''}
        tone={toggleTarget?.active ? 'warning' : 'default'}
        onCancel={() => setToggleTarget(null)}
        onConfirm={() => {
          if (toggleTarget) toggleMutation.mutate(toggleTarget)
          setToggleTarget(null)
        }}
      />
    </div>
  )
}
