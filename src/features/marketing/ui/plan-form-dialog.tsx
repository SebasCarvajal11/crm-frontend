import { useState, type FormEvent } from 'react'
import { Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/shared/lib/utils'
import type { MarketingPlan, PlanInput } from '../api/plans-api'
import {
  PLAN_COLOR_SWATCHES,
  normalizeHex,
  nextSortOrder,
  planChipStyle,
  validatePlanForm,
  type PlanFormErrors,
} from './plans.utils'

interface PlanFormDialogProps {
  open: boolean
  /** Plan a editar; null para crear uno nuevo. */
  plan: MarketingPlan | null
  plans: MarketingPlan[]
  isPending: boolean
  serverError?: string | null
  onClose: () => void
  onSubmit: (input: PlanInput) => void
}

export function PlanFormDialog(props: PlanFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent size="lg">
        {props.open && <PlanForm key={props.plan?.planId ?? 'nuevo'} {...props} />}
      </DialogContent>
    </Dialog>
  )
}

function PlanForm({ plan, plans, isPending, serverError, onClose, onSubmit }: PlanFormDialogProps) {
  const [name, setName] = useState(plan?.name ?? '')
  const [color, setColor] = useState(plan?.color ?? PLAN_COLOR_SWATCHES[3])
  const [description, setDescription] = useState(plan?.description ?? '')
  const [sortOrder, setSortOrder] = useState(String(plan?.sortOrder ?? nextSortOrder(plans)))
  const [errors, setErrors] = useState<PlanFormErrors>({})

  function enviar(e: FormEvent) {
    e.preventDefault()
    const orden = Number(sortOrder)
    const nuevos = validatePlanForm({ name, color, sortOrder: orden }, plans, plan?.planId)
    setErrors(nuevos)
    if (Object.keys(nuevos).length > 0) return
    onSubmit({
      name: name.trim(),
      color: normalizeHex(color) ?? color,
      description: description.trim() ? description.trim() : null,
      sortOrder: orden,
    })
  }

  const colorValido = normalizeHex(color)

  return (
    <form onSubmit={enviar} className="flex min-h-0 flex-1 flex-col" noValidate>
      <DialogHeader>
        <DialogMedia variant="default">
          <Tag className="size-5" />
        </DialogMedia>
        <div className="flex min-w-0 flex-col gap-1 text-left">
          <DialogTitle>{plan ? `Editar plan ${plan.name}` : 'Nuevo plan'}</DialogTitle>
          <DialogDescription>
            {plan && plan.clientCount > 0
              ? `Si cambia el nombre, los ${plan.clientCount} cliente(s) con este plan se actualizan solos.`
              : 'Los planes clasifican a los clientes y sirven para segmentar y filtrar plantillas.'}
          </DialogDescription>
        </div>
      </DialogHeader>

      <DialogBody className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <Label htmlFor="plan-name" className="text-xs font-medium text-foreground/90">
            Nombre *
          </Label>
          <Input
            id="plan-name"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Esmeralda"
            aria-invalid={Boolean(errors.name)}
            className="h-9 rounded-xl border-border/70 text-xs"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="plan-color" className="text-xs font-medium text-foreground/90">
            Color
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            {PLAN_COLOR_SWATCHES.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => setColor(swatch)}
                aria-label={`Usar el color ${swatch}`}
                aria-pressed={normalizeHex(color) === swatch}
                className={cn(
                  'size-7 rounded-full border-2 transition-transform hover:scale-110',
                  normalizeHex(color) === swatch
                    ? 'border-foreground ring-2 ring-primary/30'
                    : 'border-transparent'
                )}
                style={{ backgroundColor: swatch }}
              />
            ))}
            <input
              type="color"
              aria-label="Elegir otro color"
              value={colorValido ?? '#64748b'}
              onChange={(e) => setColor(e.target.value)}
              className="h-7 w-9 cursor-pointer rounded-md border border-input bg-background p-0.5"
            />
            <Input
              id="plan-color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-invalid={Boolean(errors.color)}
              className="h-8 w-28 rounded-xl border-border/70 font-mono text-xs"
            />
          </div>
          {errors.color && <p className="text-xs text-destructive">{errors.color}</p>}
          <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
            Vista previa:
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground"
              style={planChipStyle(colorValido)}
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: colorValido ?? '#64748b' }} />
              {name.trim() || 'Nombre del plan'}
            </span>
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="plan-description" className="text-xs font-medium text-foreground/90">
            Descripción
          </Label>
          <Textarea
            id="plan-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Qué incluye el plan o a qué clientes aplica."
            className="min-h-20 resize-y rounded-xl border-border/70 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="plan-order" className="text-xs font-medium text-foreground/90">
            Orden
          </Label>
          <Input
            id="plan-order"
            type="number"
            min={0}
            step={1}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-invalid={Boolean(errors.sortOrder)}
            className="h-9 w-28 rounded-xl border-border/70 text-xs"
          />
          <p className="text-[11px] text-muted-foreground">Define en qué posición aparece en listas y selectores.</p>
          {errors.sortOrder && <p className="text-xs text-destructive">{errors.sortOrder}</p>}
        </div>

        {serverError && <p className="text-xs font-medium text-destructive">{serverError}</p>}
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending} className="rounded-xl text-xs font-medium shadow-xs">
          {isPending ? 'Guardando…' : plan ? 'Guardar cambios' : 'Crear plan'}
        </Button>
      </DialogFooter>
    </form>
  )
}
