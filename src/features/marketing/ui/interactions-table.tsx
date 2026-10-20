import { Bot, CheckCircle2, MessageSquare, MessageSquarePlus, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { MarketingInteraction } from '../api/interactions-api'
import { typeMeta, formatDateTime } from './interaction-types.constants'
import { DeliveryBadge } from './delivery-badge'

interface InteractionsTableProps {
  filtered: MarketingInteraction[]
  clientLabel: (clientId: string) => string
  onOpenDialog: (interaction: MarketingInteraction) => void
  onWhatsApp?: (interaction: MarketingInteraction) => void
}

export function InteractionsTable({
  filtered,
  clientLabel,
  onOpenDialog,
  onWhatsApp,
}: InteractionsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto scroll-smooth scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Canal</th>
                <th className="px-4 py-3 font-semibold">Entrega</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Origen</th>
                <th className="px-4 py-3 font-semibold">Respuesta</th>
                <th className="px-4 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((interaction) => {
                const meta = typeMeta(interaction.interactionType)
                const esAutomatica = interaction.executionId != null
                return (
                  <tr
                    key={interaction.interactionId}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors duration-150"
                  >
                    <td className="px-4 py-3 font-medium">
                      {clientLabel(interaction.clientId)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                      {formatDateTime(interaction.contactDate)}
                    </td>
                    <td className="px-4 py-3 text-xs">{interaction.channel ?? '—'}</td>
                    <td className="px-4 py-3">
                      {interaction.deliveryStatus ? (
                        <DeliveryBadge
                          status={interaction.deliveryStatus}
                          error={interaction.deliveryError}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                          meta.chip,
                        ].join(' ')}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        {esAutomatica ? (
                          <>
                            <Bot className="h-3.5 w-3.5" />
                            Automática
                          </>
                        ) : (
                          <>
                            <User className="h-3.5 w-3.5" />
                            Manual
                          </>
                        )}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      {interaction.response ? (
                        <span className="line-clamp-2 text-xs" title={interaction.response}>
                          {interaction.response}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin respuesta</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {onWhatsApp && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 whitespace-nowrap text-xs"
                            onClick={() => onWhatsApp(interaction)}
                            aria-label={`Abrir en WhatsApp a ${clientLabel(interaction.clientId)}`}
                            title="Abrir en WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            WhatsApp
                          </Button>
                        )}
                        <Button
                          variant={interaction.response ? 'ghost' : 'outline'}
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => onOpenDialog(interaction)}
                        >
                          {interaction.response ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Editar
                            </>
                          ) : (
                            <>
                              <MessageSquarePlus className="h-3.5 w-3.5" />
                              Registrar
                            </>
                          )}
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
