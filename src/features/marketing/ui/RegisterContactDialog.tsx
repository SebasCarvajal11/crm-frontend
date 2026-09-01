import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { createInteractionRequest, type InteractionType } from '../api/interactions-api'
import { listClientsRequest } from '../api/clients-api'
import { listCampaignsRequest } from '../api/marketing-api'

interface RegisterContactDialogProps {
  accessToken: string
}

const CANALES = [
  { value: 'llamada', label: 'Llamada telefónica' },
  { value: 'reunion', label: 'Reunión presencial' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Correo enviado a mano' },
  { value: 'redes', label: 'Redes sociales' },
  { value: 'otro', label: 'Otro' },
]

const TIPOS: { value: InteractionType; label: string; ayuda: string }[] = [
  { value: 'message', label: 'Contacto realizado', ayuda: 'Nos comunicamos, sin respuesta aún' },
  { value: 'inquiry', label: 'El cliente consultó', ayuda: 'Pidió información o cotización' },
  { value: 'purchase', label: 'El cliente compró', ayuda: 'Se cerró una venta' },
  { value: 'testimonial', label: 'Dio testimonio', ayuda: 'Recomendó o valoró el servicio' },
  { value: 'no_response', label: 'No hubo respuesta', ayuda: 'Se intentó y no contestó' },
]

export function RegisterContactDialog({ accessToken }: RegisterContactDialogProps) {
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [clientId, setClientId] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [channel, setChannel] = useState('llamada')
  const [interactionType, setInteractionType] = useState<InteractionType>('message')
  const [response, setResponse] = useState('')
  const [error, setError] = useState<string | null>(null)

  const clientsQuery = useQuery({
    queryKey: ['marketing', 'clients'],
    queryFn: () => listClientsRequest(accessToken),
    enabled: open,
  })

  const campaignsQuery = useQuery({
    queryKey: ['marketing', 'campaigns'],
    queryFn: () => listCampaignsRequest(accessToken),
    enabled: open,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createInteractionRequest(accessToken, {
        campaignId: Number(campaignId),
        clientId,
        channel,
        interactionType,
        response: response.trim() ? response.trim() : null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['marketing', 'interactions'] })
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
      cerrar()
    },
    onError: () =>
      setError('No se pudo registrar el contacto. Verifique el cliente y la campaña.'),
  })

  function cerrar() {
    setOpen(false)
    setClientId('')
    setCampaignId('')
    setChannel('llamada')
    setInteractionType('message')
    setResponse('')
    setError(null)
  }

  function enviar() {
    setError(null)
    if (!clientId) {
      setError('Seleccione el cliente con quien se tuvo el contacto.')
      return
    }
    if (!campaignId) {
      setError('Seleccione la campaña a la que pertenece este contacto.')
      return
    }
    createMutation.mutate()
  }

  const campaigns = campaignsQuery.data ?? []
  const clients = clientsQuery.data ?? []
  const tipoSeleccionado = TIPOS.find((t) => t.value === interactionType)

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <PhoneCall className="h-4 w-4" />
        Registrar contacto
      </Button>

      <Dialog open={open} onOpenChange={(v) => !v && cerrar()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar un contacto realizado</DialogTitle>
            <DialogDescription>
              Deje constancia de una llamada, reunión o mensaje que ya ocurrió fuera del
              sistema. Esto no envía nada: solo completa el historial del cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rc-client">Cliente</Label>
              <NativeSelect
                id="rc-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Seleccione un cliente…</option>
                {clients.map((c) => (
                  <option key={c.clientId} value={c.clientId}>
                    {c.contactInfo || c.additionalInfo || c.clientId}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rc-campaign">Campaña relacionada</Label>
              <NativeSelect
                id="rc-campaign"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
              >
                <option value="">Seleccione una campaña…</option>
                {campaigns.map((c) => (
                  <option key={c.campaignId} value={c.campaignId}>
                    {c.campaignName}
                  </option>
                ))}
              </NativeSelect>
              <p className="text-xs text-muted-foreground">
                Todo contacto pertenece a una campaña; es lo que permite medir su
                efectividad.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rc-channel">Canal</Label>
                <NativeSelect
                  id="rc-channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  {CANALES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rc-type">Resultado</Label>
                <NativeSelect
                  id="rc-type"
                  value={interactionType}
                  onChange={(e) => setInteractionType(e.target.value as InteractionType)}
                >
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </NativeSelect>
                {tipoSeleccionado && (
                  <p className="text-xs text-muted-foreground">{tipoSeleccionado.ayuda}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rc-response">Notas (opcional)</Label>
              <Textarea
                id="rc-response"
                rows={3}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Llamada de seguimiento: solicitó ampliar la cotización a dos piezas…"
                className="min-h-24 resize-y"
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={cerrar} disabled={createMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={enviar} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Registrando…' : 'Registrar contacto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
