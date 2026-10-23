import { useState } from 'react'
import { Loader2, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { SavedSegment, SegmentCriteria } from '../api/segments-api'
import { criteriaSummary } from './segment-criteria.utils'

export interface SaveSegmentDialogProps {
  open: boolean
  /** null = crear con los criterios calculados; con valor = editar ese segmento. */
  editing: SavedSegment | null
  /** Criterios del segmentador (los que se guardan al crear). */
  criteria: SegmentCriteria
  /** Al editar: si hay criterios calculados, se pueden poner en lugar de los guardados. */
  canReplaceCriteria: boolean
  isPending: boolean
  error?: string | null
  onSubmit: (values: { name: string; description: string; replaceCriteria: boolean }) => void
  onClose: () => void
}

/** Nombre y descripción de un segmento guardado (crear desde los criterios o editar). */
export function SaveSegmentDialog(props: SaveSegmentDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={(o) => !o && !props.isPending && props.onClose()}>
      <DialogContent size="md">
        {props.open && <SaveSegmentForm key={props.editing?.segmentId ?? 'nuevo'} {...props} />}
      </DialogContent>
    </Dialog>
  )
}

function SaveSegmentForm({ editing, criteria, canReplaceCriteria, isPending, error, onSubmit, onClose }: SaveSegmentDialogProps) {
  const [name, setName] = useState(editing?.name ?? '')
  const [description, setDescription] = useState(editing?.description ?? '')
  const [replaceCriteria, setReplaceCriteria] = useState(false)
  const shown = editing && !replaceCriteria ? editing.criteria : criteria

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) onSubmit({ name: name.trim(), description: description.trim(), replaceCriteria })
      }}
    >
      <DialogHeader>
        <DialogMedia variant="default">
          <Target className="size-5" />
        </DialogMedia>
        <div className="flex min-w-0 flex-col gap-1 text-left">
          <DialogTitle>{editing ? 'Editar segmento guardado' : 'Guardar como segmento'}</DialogTitle>
          <DialogDescription>Un segmento guardado puede ser la audiencia de una campaña.</DialogDescription>
        </div>
      </DialogHeader>
      <DialogBody className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="segment-name" className="text-xs font-medium">
            Nombre *
          </Label>
          <Input
            id="segment-name"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Oro sin proyecto"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="segment-description" className="text-xs font-medium">
            Descripción
          </Label>
          <Textarea
            id="segment-description"
            rows={2}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Para qué sirve este grupo de clientes"
            className="text-sm"
          />
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-xs">
          <p className="font-semibold">Criterios</p>
          <p className="text-muted-foreground" data-testid="segment-criteria-summary">
            {criteriaSummary(shown)}
          </p>
        </div>
        {editing && canReplaceCriteria && (
          <label className="flex cursor-pointer items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={replaceCriteria}
              onChange={(e) => setReplaceCriteria(e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            Reemplazar los criterios por los que acaba de calcular en el segmentador
          </label>
        )}
        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending || !name.trim()} className="gap-1.5">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {editing ? 'Guardar cambios' : 'Guardar segmento'}
        </Button>
      </DialogFooter>
    </form>
  )
}
