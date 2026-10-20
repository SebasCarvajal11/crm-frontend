import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
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
import type { MarketingPlan } from '../api/plans-api'
import type { MessageTemplate, TemplateChannel, TemplateInput } from '../api/templates-api'
import {
  TEMPLATE_CHANNELS,
  TEMPLATE_VARIABLES,
  insertAtCursor,
  validateTemplateForm,
  type TemplateFormErrors,
} from './templates.utils'

interface TemplateEditorDialogProps {
  open: boolean
  /** Plantilla a editar; null para crear una nueva. */
  template: MessageTemplate | null
  plans: MarketingPlan[]
  isPending: boolean
  serverError?: string | null
  onClose: () => void
  onSubmit: (input: TemplateInput) => void
  /** Vista previa con un cliente (solo al editar: usa la versión guardada). */
  previewSlot?: ReactNode
}

export function TemplateEditorDialog(props: TemplateEditorDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent size="xl">
        {props.open && <TemplateEditorForm key={props.template?.templateId ?? 'nueva'} {...props} />}
      </DialogContent>
    </Dialog>
  )
}

type CampoConVariables = 'subject' | 'body'

export function TemplateEditorForm({
  template,
  plans,
  isPending,
  serverError,
  onClose,
  onSubmit,
  previewSlot,
}: TemplateEditorDialogProps) {
  const [name, setName] = useState(template?.name ?? '')
  const [channel, setChannel] = useState<TemplateChannel>(template?.channel ?? 'EMAIL')
  const [plan, setPlan] = useState(template?.plan ?? '')
  const [subject, setSubject] = useState(template?.subject ?? '')
  const [body, setBody] = useState(template?.body ?? '')
  const [errors, setErrors] = useState<TemplateFormErrors>({})
  const [campoActivo, setCampoActivo] = useState<CampoConVariables>('body')
  const subjectRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const esCorreo = channel === 'EMAIL'
  // Planes que se pueden elegir: los activos y, si se edita, el plan actual aunque esté inactivo.
  const opcionesPlan = plans.filter((p) => p.active || p.name === template?.plan)

  function insertar(token: string) {
    const campo: CampoConVariables = esCorreo ? campoActivo : 'body'
    const el = campo === 'subject' ? subjectRef.current : bodyRef.current
    const actual = campo === 'subject' ? subject : body
    const { text, cursor } = insertAtCursor(actual, el?.selectionStart, el?.selectionEnd, token)
    if (campo === 'subject') setSubject(text)
    else setBody(text)
    // Devuelve el foco con el cursor después de la variable insertada.
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(cursor, cursor)
    })
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    const nuevos = validateTemplateForm({ name, channel, subject, body })
    setErrors(nuevos)
    if (Object.keys(nuevos).length > 0) return
    onSubmit({
      name: name.trim(),
      channel,
      plan: plan || null,
      subject: esCorreo && subject.trim() ? subject.trim() : null,
      body: body.trim(),
    })
  }

  return (
    <form onSubmit={enviar} className="flex min-h-0 flex-1 flex-col" noValidate>
      <DialogHeader>
        <DialogMedia variant="default">
          <FileText className="size-5" />
        </DialogMedia>
        <div className="flex min-w-0 flex-col gap-1 text-left">
          <DialogTitle>{template ? 'Editar plantilla' : 'Nueva plantilla'}</DialogTitle>
          <DialogDescription>
            Las variables se reemplazan con los datos de cada cliente al enviar.
          </DialogDescription>
        </div>
      </DialogHeader>

      <DialogBody className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <Label htmlFor="tpl-name" className="text-xs font-medium text-foreground/90">
            Nombre *
          </Label>
          <Input
            id="tpl-name"
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Bienvenida plan Oro"
            aria-invalid={Boolean(errors.name)}
            className="h-9 rounded-xl border-border/70 text-xs"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-channel" className="text-xs font-medium text-foreground/90">
              Canal
            </Label>
            <NativeSelect
              id="tpl-channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value as TemplateChannel)}
              className="rounded-xl border-border/70 text-xs"
            >
              {TEMPLATE_CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-plan" className="text-xs font-medium text-foreground/90">
              Plan
            </Label>
            <NativeSelect
              id="tpl-plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="rounded-xl border-border/70 text-xs"
            >
              <option value="">Todos los planes</option>
              {opcionesPlan.map((p) => (
                <option key={p.planId} value={p.name}>
                  {p.name}
                  {p.active ? '' : ' (inactivo)'}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-foreground/90">Insertar variable</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Insertar variable">
            {TEMPLATE_VARIABLES.map((v) => (
              <Button
                key={v.token}
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-lg px-2 font-mono text-[11px]"
                // Evita que el botón robe el foco y se pierda la posición del cursor.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertar(v.token)}
                title={`Insertar ${v.label.toLowerCase()}`}
              >
                {v.token}
              </Button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Se inserta donde está el cursor{esCorreo ? ', en el asunto o en el cuerpo' : ''}.
          </p>
        </div>

        {esCorreo && (
          <div className="space-y-1.5">
            <Label htmlFor="tpl-subject" className="text-xs font-medium text-foreground/90">
              Asunto
            </Label>
            <Input
              id="tpl-subject"
              ref={subjectRef}
              value={subject}
              maxLength={200}
              onFocus={() => setCampoActivo('subject')}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ej. {nombre}, tenemos novedades para su plan {plan}"
              aria-invalid={Boolean(errors.subject)}
              className="h-9 rounded-xl border-border/70 text-xs"
            />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="tpl-body" className="text-xs font-medium text-foreground/90">
            Cuerpo *
          </Label>
          <Textarea
            id="tpl-body"
            ref={bodyRef}
            rows={7}
            value={body}
            onFocus={() => setCampoActivo('body')}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Hola {nombre}, …"
            aria-invalid={Boolean(errors.body)}
            className="min-h-36 resize-y rounded-xl border-border/70 text-xs"
          />
          {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
        </div>

        {template && previewSlot && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-foreground/90">
              Vista previa <span className="font-normal text-muted-foreground">(versión guardada)</span>
            </p>
            {previewSlot}
          </div>
        )}

        {serverError && <p className="text-xs font-medium text-destructive">{serverError}</p>}
      </DialogBody>

      <DialogFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
          Cancelar
        </Button>
        <Button type="submit" size="sm" disabled={isPending} className="rounded-xl text-xs font-medium shadow-xs">
          {isPending ? 'Guardando…' : template ? 'Guardar cambios' : 'Crear plantilla'}
        </Button>
      </DialogFooter>
    </form>
  )
}
