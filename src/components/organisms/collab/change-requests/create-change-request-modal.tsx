import { useState } from 'react'
import { AlertCircle, GitPullRequest, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  createMinorChangeRequestRequest,
  createFormalChangeRequestRequest,
} from '@/features/collab/api'
import type { ChangeRequestPriority, ChangeRequestType, ProjectTask } from '@/features/collab/model'

type Props = {
  open: boolean
  accessToken: string
  projectId: string
  tasks: ProjectTask[]
  onClose: () => void
  onSuccess: () => void
}

export function CreateChangeRequestModal({ open, accessToken, projectId, tasks, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [justification, setJustification] = useState('')
  const [type, setType] = useState<ChangeRequestType>('minor')
  const [priority, setPriority] = useState<ChangeRequestPriority>('medium')
  const [taskId, setTaskId] = useState<string>('none')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setJustification('')
    setType('minor')
    setPriority('medium')
    setTaskId('none')
    setErrorMsg(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return setErrorMsg('Ingresa un título para la solicitud')
    if (!description.trim()) return setErrorMsg('Ingresa una descripción del cambio requerido')

    try {
      setIsSubmitting(true)
      setErrorMsg(null)
      const selectedTaskId = taskId !== 'none' ? taskId : undefined

      if (type === 'minor') {
        await createMinorChangeRequestRequest(accessToken, projectId, {
          title: title.trim(),
          description: description.trim(),
          task_id: selectedTaskId,
          priority,
        })
      } else {
        await createFormalChangeRequestRequest(accessToken, projectId, {
          title: title.trim(),
          description: description.trim(),
          justification: justification.trim() || 'Solicitud de cambio formal por cliente',
          task_id: selectedTaskId,
          priority,
        })
      }

      resetForm()
      onSuccess()
      onClose()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al enviar la solicitud')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { resetForm(); onClose() } }}>
      <DialogContent size="lg">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <DialogHeader>
            <DialogMedia variant="default">
              <GitPullRequest className="size-5" />
            </DialogMedia>
            <div className="flex flex-col gap-1 text-left min-w-0">
              <DialogTitle>Solicitar cambio de proyecto</DialogTitle>
              <DialogDescription>
                Describe el requerimiento o ajuste que deseas solicitar. Será revisado por un administrador.
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {errorMsg && (
              <Alert variant="destructive" className="py-2.5 rounded-xl border-destructive/30">
                <AlertCircle className="size-4" />
                <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="cr-type" className="text-xs font-medium text-foreground/90">
                  Tipo de cambio
                </Label>
                <Select value={type} onValueChange={(v) => setType(v as ChangeRequestType)}>
                  <SelectTrigger id="cr-type" className="h-9 rounded-xl border-border/70 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor" className="text-xs">Ajuste menor (Puntual)</SelectItem>
                    <SelectItem value="formal" className="text-xs">Cambio formal (Alcance)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cr-priority" className="text-xs font-medium text-foreground/90">
                  Urgencia / Prioridad
                </Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as ChangeRequestPriority)}>
                  <SelectTrigger id="cr-priority" className="h-9 rounded-xl border-border/70 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="text-xs">Baja</SelectItem>
                    <SelectItem value="medium" className="text-xs">Media</SelectItem>
                    <SelectItem value="high" className="text-xs">Alta</SelectItem>
                    <SelectItem value="urgent" className="text-xs font-semibold text-rose-600">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cr-title" className="text-xs font-medium text-foreground/90">
                Título del requerimiento
              </Label>
              <Input
                id="cr-title"
                placeholder="Ej. Modificar texto en cabecera principal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 rounded-xl border-border/70 text-xs focus-visible:ring-primary/20"
                maxLength={200}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cr-task" className="text-xs font-medium text-foreground/90">
                Entregable o tarea asociada (opcional)
              </Label>
              <Select value={taskId} onValueChange={setTaskId}>
                <SelectTrigger id="cr-task" className="h-9 rounded-xl border-border/70 text-xs">
                  <SelectValue placeholder="General del proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">General del proyecto</SelectItem>
                  {tasks.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs truncate">
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cr-desc" className="text-xs font-medium text-foreground/90">
                Descripción detallada
              </Label>
              <Textarea
                id="cr-desc"
                placeholder="Detalla qué cambio necesitas y el resultado esperado..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[85px] rounded-xl border-border/70 text-xs resize-none focus-visible:ring-primary/20"
                maxLength={3000}
              />
            </div>

            {type === 'formal' && (
              <div className="space-y-1.5">
                <Label htmlFor="cr-just" className="text-xs font-medium text-foreground/90">
                  Justificación del cambio
                </Label>
                <Textarea
                  id="cr-just"
                  placeholder="Explica la justificación o razón estratégica de este cambio de alcance..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="min-h-[70px] rounded-xl border-border/70 text-xs resize-none focus-visible:ring-primary/20"
                  maxLength={2000}
                />
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="rounded-xl text-xs gap-1.5 shadow-xs font-medium"
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <GitPullRequest className="size-3.5" />
              )}
              {isSubmitting ? 'Enviando...' : 'Solicitar cambio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
