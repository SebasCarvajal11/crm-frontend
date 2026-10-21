import { Bot, CheckCircle2, MessageSquare, MessageSquarePlus, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MarketingInteraction } from '../api/interactions-api'
import { typeMeta, splitDateTime, channelDisplay } from './interaction-types.constants'
import { DeliveryBadge } from './delivery-badge'
import { ClientNameButton } from './client-name-button'

interface InteractionsTableProps {
  filtered: MarketingInteraction[]
  clientLabel: (clientId: string) => string
  onOpenDialog: (interaction: MarketingInteraction) => void
  onWhatsApp?: (interaction: MarketingInteraction) => void
}

// La columna de acciones queda fija a la derecha: aunque la tabla se desplace,
// los botones siempre están a la vista.
const STICKY_ACTIONS =
  'sticky right-0 z-10 bg-card shadow-[-8px_0_12px_-10px_rgba(0,0,0,0.25)] dark:shadow-[-8px_0_12px_-10px_rgba(0,0,0,0.7)]'

export function InteractionsTable({
  filtered,
  clientLabel,
  onOpenDialog,
  onWhatsApp,
}: InteractionsTableProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Hasta pantallas medianas: tarjetas (una o dos columnas), sin desplazamiento horizontal. */}
        <ul className="grid md:grid-cols-2 xl:hidden" aria-label="Interacciones">
          {filtered.map((interaction) => (
            <InteractionCard
              key={interaction.interactionId}
              interaction={interaction}
              nombre={clientLabel(interaction.clientId)}
              onOpenDialog={onOpenDialog}
              onWhatsApp={onWhatsApp}
            />
          ))}
        </ul>

        {/* Escritorio: tabla con la columna de acciones fija a la derecha. */}
        <div className="hidden overflow-x-auto scroll-smooth scrollbar-thin xl:block">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Canal y entrega</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Respuesta</th>
                <th className={`px-4 py-3 text-right font-semibold ${STICKY_ACTIONS} bg-[color-mix(in_oklab,var(--muted)_40%,var(--card))]`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((interaction) => {
                const meta = typeMeta(interaction.interactionType)
                const esAutomatica = interaction.executionId != null
                const { date, time } = splitDateTime(interaction.contactDate)
                const nombre = clientLabel(interaction.clientId)
                return (
                  <tr
                    key={interaction.interactionId}
                    className="group border-b last:border-0 hover:bg-muted/30 transition-colors duration-150"
                  >
                    <td className="min-w-40 px-4 py-3">
                      <ClientNameButton clientId={interaction.clientId} name={nombre} className="block font-medium leading-snug" />
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        {esAutomatica ? (
                          <>
                            <Bot className="h-3 w-3" aria-hidden="true" />
                            Automática
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3" aria-hidden="true" />
                            Manual
                          </>
                        )}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs tabular-nums text-muted-foreground">
                      <p className="text-foreground/80">{date}</p>
                      {time && <p>{time}</p>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="text-xs font-medium">{channelDisplay(interaction.channel)}</p>
                      {interaction.deliveryStatus && (
                        <div className="mt-1">
                          <DeliveryBadge
                            status={interaction.deliveryStatus}
                            error={interaction.deliveryError}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                          meta.chip,
                        ].join(' ')}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="min-w-36 max-w-xs px-4 py-3">
                      {interaction.response ? (
                        <span className="line-clamp-2 text-xs" title={interaction.response}>
                          {interaction.response}
                        </span>
                      ) : (
                        <span className="whitespace-nowrap text-xs text-muted-foreground">Sin respuesta</span>
                      )}
                    </td>
                    <td className={`px-3 py-3 text-right ${STICKY_ACTIONS} transition-colors duration-150 group-hover:bg-[color-mix(in_oklab,var(--muted)_30%,var(--card))]`}>
                      <div className="flex justify-end gap-1.5">
                        {onWhatsApp && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onWhatsApp(interaction)}
                            aria-label={`Abrir en WhatsApp a ${nombre}`}
                            title="Abrir en WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant={interaction.response ? 'ghost' : 'outline'}
                          size="sm"
                          className="h-8 gap-1.5 whitespace-nowrap text-xs"
                          onClick={() => onOpenDialog(interaction)}
                          aria-label={`${interaction.response ? 'Editar' : 'Registrar'} la respuesta de ${nombre}`}
                          title={interaction.response ? 'Editar la respuesta' : 'Registrar la respuesta del cliente'}
                        >
                          <ResponseActionLabel hasResponse={Boolean(interaction.response)} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function ResponseActionLabel({ hasResponse }: { hasResponse: boolean }) {
  return hasResponse ? (
    <>
      <CheckCircle2 className="h-3.5 w-3.5" />
      Editar
    </>
  ) : (
    <>
      <MessageSquarePlus className="h-3.5 w-3.5" />
      Registrar
    </>
  )
}

function InteractionCard({
  interaction,
  nombre,
  onOpenDialog,
  onWhatsApp,
}: {
  interaction: MarketingInteraction
  nombre: string
  onOpenDialog: (interaction: MarketingInteraction) => void
  onWhatsApp?: (interaction: MarketingInteraction) => void
}) {
  const meta = typeMeta(interaction.interactionType)
  const { date, time } = splitDateTime(interaction.contactDate)
  const esAutomatica = interaction.executionId != null
  return (
    <li
      className="flex flex-col gap-2.5 border-b p-4 last:border-b-0 md:odd:border-r md:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
      data-testid="interaction-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <ClientNameButton clientId={interaction.clientId} name={nombre} className="block font-medium leading-snug" />
          <p className="text-xs text-muted-foreground tabular-nums">
            {date}
            {time ? ` · ${time}` : ''} · {esAutomatica ? 'Automática' : 'Manual'}
          </p>
        </div>
        <span
          className={[
            'inline-flex shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold',
            meta.chip,
          ].join(' ')}
        >
          {meta.label}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium">{channelDisplay(interaction.channel)}</span>
        {interaction.deliveryStatus && (
          <DeliveryBadge status={interaction.deliveryStatus} error={interaction.deliveryError} />
        )}
      </div>
      {interaction.response ? (
        <p className="line-clamp-3 rounded-lg bg-muted/40 p-2 text-xs">{interaction.response}</p>
      ) : (
        <p className="text-xs text-muted-foreground">Sin respuesta</p>
      )}
      <div className="mt-auto flex gap-2 pt-1">
        {onWhatsApp && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 flex-1 gap-1.5 text-xs"
            onClick={() => onWhatsApp(interaction)}
            aria-label={`Abrir en WhatsApp a ${nombre}`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            WhatsApp
          </Button>
        )}
        <Button
          variant={interaction.response ? 'ghost' : 'outline'}
          size="sm"
          className="h-9 flex-1 gap-1.5 text-xs"
          onClick={() => onOpenDialog(interaction)}
          aria-label={`${interaction.response ? 'Editar' : 'Registrar'} la respuesta de ${nombre}`}
        >
          <ResponseActionLabel hasResponse={Boolean(interaction.response)} />
        </Button>
      </div>
    </li>
  )
}
