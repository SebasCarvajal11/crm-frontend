import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { commercialKeys, getClientTimelineRequest } from '../api/commercial-api'
import { usePlans } from '../hooks/use-plans'
import { Client360Context, type Client360Target } from './client360-context'
import { Client360View } from './client360-view'
import { RegisterContactDialog } from './RegisterContactDialog'
import { WhatsAppDialog, type WhatsAppTarget } from './WhatsAppDialog'
import { isNotFoundError } from './commercial.utils'

interface Client360ProviderProps {
  accessToken: string
  children: ReactNode
  /** Abre el formulario de propuesta con el cliente preseleccionado (solo en Marketing). */
  onNewProposal?: (clientId: string) => void
  onGoToTemplates?: () => void
  /** Abre la pestaña Mensajes con la conversación del cliente (solo en Marketing). */
  onSendMessage?: (target: Client360Target) => void
}

/**
 * Provee la ficha 360° a cualquier nombre de cliente que esté dentro
 * (ClientNameButton) y la muestra en un panel lateral.
 */
export function Client360Provider({
  accessToken,
  children,
  onNewProposal,
  onGoToTemplates,
  onSendMessage,
}: Client360ProviderProps) {
  const [target, setTarget] = useState<Client360Target | null>(null)
  const [contactOpen, setContactOpen] = useState(false)
  const [whatsApp, setWhatsApp] = useState<WhatsAppTarget | null>(null)

  const openClient360 = useCallback((next: Client360Target) => setTarget(next), [])
  const value = useMemo(() => ({ openClient360 }), [openClient360])

  return (
    <Client360Context.Provider value={value}>
      {children}
      <Sheet open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
        <SheetContent
          side="right"
          className="w-full gap-0 sm:data-[side=right]:max-w-xl"
          data-tour="marketing-client360"
        >
          <SheetHeader className="pr-12 sm:px-5">
            <SheetTitle className="text-lg font-bold tracking-tight">
              {target?.name || 'Ficha del cliente'}
            </SheetTitle>
            <SheetDescription>Ficha 360°: todo lo que ha pasado con este cliente.</SheetDescription>
          </SheetHeader>
          {target && (
            <Client360Body
              key={target.clientId}
              accessToken={accessToken}
              clientId={target.clientId}
              onRegisterContact={() => setContactOpen(true)}
              onWhatsApp={(name) => setWhatsApp({ clientId: target.clientId, clientName: name })}
              onNewProposal={
                onNewProposal
                  ? () => {
                      const clientId = target.clientId
                      setTarget(null)
                      onNewProposal(clientId)
                    }
                  : undefined
              }
              onSendMessage={
                onSendMessage
                  ? (name) => {
                      const next = { clientId: target.clientId, name: name || target.name }
                      setTarget(null)
                      onSendMessage(next)
                    }
                  : undefined
              }
            />
          )}
        </SheetContent>
      </Sheet>

      <RegisterContactDialog
        accessToken={accessToken}
        hideTrigger
        open={contactOpen}
        onOpenChange={setContactOpen}
        initialClientId={target?.clientId}
      />
      <WhatsAppDialog
        accessToken={accessToken}
        target={whatsApp}
        onClose={() => setWhatsApp(null)}
        onGoToTemplates={
          onGoToTemplates
            ? () => {
                setWhatsApp(null)
                setTarget(null)
                onGoToTemplates()
              }
            : undefined
        }
      />
    </Client360Context.Provider>
  )
}

function Client360Body({
  accessToken,
  clientId,
  onRegisterContact,
  onWhatsApp,
  onNewProposal,
  onSendMessage,
}: {
  accessToken: string
  clientId: string
  onRegisterContact: () => void
  onWhatsApp: (name: string) => void
  onNewProposal?: () => void
  onSendMessage?: (name: string) => void
}) {
  const { plans } = usePlans(accessToken)
  const query = useQuery({
    queryKey: commercialKeys.timeline(clientId),
    queryFn: () => getClientTimelineRequest(accessToken, clientId),
    retry: (count, error) => !isNotFoundError(error) && count < 1,
  })
  const notFound = query.isError && isNotFoundError(query.error)
  const name = query.data?.client?.name ?? ''

  return (
    <Client360View
      data={query.data}
      isLoading={query.isLoading}
      isError={query.isError}
      notFound={notFound}
      plans={plans}
      onRetry={() => void query.refetch()}
      onRegisterContact={onRegisterContact}
      onWhatsApp={() => onWhatsApp(name || 'el cliente')}
      onNewProposal={onNewProposal}
      onSendMessage={onSendMessage && !notFound ? () => onSendMessage(name) : undefined}
    />
  )
}
