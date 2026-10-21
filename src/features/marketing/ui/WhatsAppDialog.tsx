import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { createInteractionRequest } from '../api/interactions-api'
import { listCampaignsRequest } from '../api/marketing-api'
import { listTemplatesRequest, previewTemplateRequest } from '../api/templates-api'
import { buildWhatsAppUrl, campaignsForClient, WHATSAPP_CHANNEL } from './whatsapp.utils'

export interface WhatsAppTarget {
  clientId: string
  clientName: string
  /** Campaña ya conocida (p. ej. al abrir desde una interacción). */
  campaignId?: number | null
}

interface WhatsAppDialogProps {
  accessToken: string
  target: WhatsAppTarget | null
  onClose: () => void
  /** Lleva a la pestaña Plantillas cuando no hay plantillas de WhatsApp. */
  onGoToTemplates?: () => void
}

/**
 * Abre WhatsApp con un mensaje armado desde una plantilla WHATSAPP y deja
 * registrada la interacción (canal "whatsapp", tipo "message").
 */
export function WhatsAppDialog({ accessToken, target, onClose, onGoToTemplates }: WhatsAppDialogProps) {
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogMedia variant="success">
            <MessageSquare className="size-5" />
          </DialogMedia>
          <div className="flex min-w-0 flex-col gap-1 text-left">
            <DialogTitle>Abrir en WhatsApp</DialogTitle>
            <DialogDescription>
              {target ? `Mensaje para ${target.clientName}. ` : ''}WhatsApp le pedirá elegir el
              contacto, porque el cliente no tiene teléfono registrado.
            </DialogDescription>
          </div>
        </DialogHeader>
        {target && (
          <WhatsAppDialogBody
            key={target.clientId}
            accessToken={accessToken}
            target={target}
            onClose={onClose}
            onGoToTemplates={onGoToTemplates}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function WhatsAppDialogBody({
  accessToken,
  target,
  onClose,
  onGoToTemplates,
}: {
  accessToken: string
  target: WhatsAppTarget
  onClose: () => void
  onGoToTemplates?: () => void
}) {
  const queryClient = useQueryClient()
  const [templateId, setTemplateId] = useState('')
  const [campaignId, setCampaignId] = useState(target.campaignId ? String(target.campaignId) : '')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const templatesQuery = useQuery({
    queryKey: ['marketing', 'templates', 'WHATSAPP'],
    queryFn: () => listTemplatesRequest(accessToken, { channel: 'WHATSAPP' }),
  })
  const templates = useMemo(
    () => (templatesQuery.data ?? []).filter((t) => t.active),
    [templatesQuery.data]
  )

  const campaignsQuery = useQuery({
    queryKey: ['marketing', 'campaigns'],
    queryFn: () => listCampaignsRequest(accessToken),
    enabled: !target.campaignId,
  })
  const { campaigns, ofClient } = useMemo(
    () => campaignsForClient(campaignsQuery.data ?? [], target.clientId),
    [campaignsQuery.data, target.clientId]
  )

  const previewQuery = useQuery({
    queryKey: ['marketing', 'templates', 'preview', templateId, target.clientId],
    queryFn: () => previewTemplateRequest(accessToken, templateId, target.clientId),
    enabled: Boolean(templateId),
  })
  const texto = message ?? previewQuery.data?.body ?? ''

  const registerMutation = useMutation({
    mutationFn: () =>
      createInteractionRequest(accessToken, {
        campaignId: Number(campaignId),
        clientId: target.clientId,
        channel: WHATSAPP_CHANNEL,
        interactionType: 'message',
        response: null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['marketing', 'interactions'] })
      void queryClient.invalidateQueries({ queryKey: ['marketing', 'today'] })
      void queryClient.invalidateQueries({ queryKey: ['marketing', 'funnel'] })
      void queryClient.invalidateQueries({ queryKey: ['marketing', 'timeline'] })
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
      onClose()
    },
    onError: () =>
      setError('WhatsApp se abrió, pero no se pudo registrar el contacto. Regístrelo en Interacciones.'),
  })

  function abrir() {
    setError(null)
    if (!templateId) return setError('Elija la plantilla del mensaje.')
    if (!texto.trim()) return setError('El mensaje está vacío.')
    if (!campaignId) return setError('Elija la campaña a la que pertenece este contacto.')
    // Se abre en el mismo clic para que el navegador no bloquee la ventana.
    window.open(buildWhatsAppUrl(texto), '_blank', 'noopener,noreferrer')
    registerMutation.mutate()
  }

  if (!templatesQuery.isLoading && templates.length === 0) {
    return (
      <>
        <DialogBody>
          <div className="rounded-xl border border-dashed border-border py-8 text-center">
            <p className="text-sm font-medium">No hay plantillas de WhatsApp activas</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
              Cree una plantilla con el canal WhatsApp en la pestaña Plantillas para armar el
              mensaje.
            </p>
            {onGoToTemplates && (
              <Button size="sm" className="mt-4" onClick={onGoToTemplates}>
                Ir a Plantillas
              </Button>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogBody className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="wa-template" className="text-xs font-medium text-foreground/90">
            Plantilla
          </Label>
          <NativeSelect
            id="wa-template"
            value={templateId}
            onChange={(e) => {
              setTemplateId(e.target.value)
              setMessage(null)
            }}
            className="rounded-xl border-border/70 text-xs"
          >
            <option value="">{templatesQuery.isLoading ? 'Cargando plantillas…' : 'Elija una plantilla…'}</option>
            {templates.map((t) => (
              <option key={t.templateId} value={t.templateId}>
                {t.name}
                {t.plan ? ` · ${t.plan}` : ''}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wa-message" className="text-xs font-medium text-foreground/90">
            Mensaje
          </Label>
          {previewQuery.isFetching && !message ? (
            <p className="flex items-center gap-2 rounded-xl border border-border/70 p-3 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Preparando el mensaje para este cliente…
            </p>
          ) : (
            <Textarea
              id="wa-message"
              rows={5}
              value={texto}
              disabled={!templateId}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Elija una plantilla para ver el mensaje con los datos del cliente."
              className="min-h-28 resize-y rounded-xl border-border/70 text-xs"
            />
          )}
          {previewQuery.isError && (
            <p className="text-xs text-destructive">No se pudo armar el mensaje con esta plantilla.</p>
          )}
          <p className="text-[11px] text-muted-foreground">
            Puede ajustar el texto antes de abrir WhatsApp.
          </p>
        </div>

        {!target.campaignId && (
          <div className="space-y-1.5">
            <Label htmlFor="wa-campaign" className="text-xs font-medium text-foreground/90">
              Campaña relacionada
            </Label>
            <NativeSelect
              id="wa-campaign"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="rounded-xl border-border/70 text-xs"
            >
              <option value="">
                {campaignsQuery.isLoading ? 'Cargando campañas…' : 'Seleccione una campaña…'}
              </option>
              {campaigns.map((c) => (
                <option key={c.campaignId} value={c.campaignId}>
                  {c.campaignName}
                </option>
              ))}
            </NativeSelect>
            <p className="text-[11px] text-muted-foreground">
              {!campaignsQuery.isLoading && campaigns.length === 0
                ? 'Cree primero una campaña: todo contacto pertenece a una.'
                : ofClient
                  ? 'Se muestran las campañas de este cliente.'
                  : 'El contacto queda registrado en esta campaña.'}
            </p>
          </div>
        )}

        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          size="sm"
          className="gap-1.5 rounded-xl text-xs font-medium"
          onClick={abrir}
          disabled={registerMutation.isPending || previewQuery.isFetching}
        >
          <ExternalLink className="size-3.5" />
          {registerMutation.isPending ? 'Registrando…' : 'Abrir WhatsApp y registrar'}
        </Button>
      </DialogFooter>
    </>
  )
}
