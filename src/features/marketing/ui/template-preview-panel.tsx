import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import type { MarketingClient } from '../api/clients-api'
import { previewTemplateRequest } from '../api/templates-api'
import { clientLabel } from './client-plans.constants'

interface TemplatePreviewPanelProps {
  accessToken: string
  templateId: string
  clients: MarketingClient[]
  /** Muestra el asunto (plantillas de correo). */
  showSubject?: boolean
  idPrefix?: string
}

/** Vista previa de una plantilla con los datos reales de un cliente (POST /preview). */
export function TemplatePreviewPanel({
  accessToken,
  templateId,
  clients,
  showSubject,
  idPrefix = 'tpl-preview',
}: TemplatePreviewPanelProps) {
  const [clientId, setClientId] = useState('')

  const previewQuery = useQuery({
    queryKey: ['marketing', 'templates', 'preview', templateId, clientId],
    queryFn: () => previewTemplateRequest(accessToken, templateId, clientId),
    enabled: Boolean(templateId && clientId),
  })

  return (
    <div className="space-y-2.5 rounded-xl border border-border/70 bg-muted/20 p-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-client`} className="text-xs font-medium text-foreground/90">
          Ver con los datos de
        </Label>
        <NativeSelect
          id={`${idPrefix}-client`}
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="rounded-xl border-border/70 bg-background text-xs"
        >
          <option value="">Elija un cliente…</option>
          {clients.map((c) => (
            <option key={c.clientId} value={c.clientId}>
              {clientLabel(c)}
            </option>
          ))}
        </NativeSelect>
      </div>

      {!clientId ? (
        <p className="text-xs text-muted-foreground">
          Elija un cliente para ver el mensaje con sus variables reemplazadas.
        </p>
      ) : previewQuery.isLoading ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
          <Loader2 className="size-3.5 animate-spin" />
          Generando vista previa…
        </p>
      ) : previewQuery.isError ? (
        <p className="text-xs text-destructive">No se pudo generar la vista previa.</p>
      ) : previewQuery.data ? (
        <div className="space-y-1.5 rounded-lg border border-border/70 bg-background p-3 text-xs" data-testid="template-preview-result">
          {showSubject && (
            <p>
              <span className="font-semibold">Asunto: </span>
              {previewQuery.data.subject || <span className="text-muted-foreground">(sin asunto)</span>}
            </p>
          )}
          <p className="whitespace-pre-wrap leading-relaxed">{previewQuery.data.body}</p>
        </div>
      ) : null}
    </div>
  )
}
