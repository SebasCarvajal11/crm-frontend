import { useState } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import { useSessionStore } from '@/app/session/session-store'
import { getAccessTokenRole, getAccessTokenSubject } from '@/shared/lib/access-token-role'
import { FloatingActionContainer } from '@/components/ui/floating-action-container'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { PresenceHeartbeat } from './presence-heartbeat'
import { PresencePanel } from './presence-panel'

function AdminPresenceWidget({ owner }: { owner: string }) {
  const [open, setOpen] = useState(false)
  return <Dialog open={open} onOpenChange={setOpen}>
    <FloatingActionContainer actionIndex={2} aria-label="Presencia de usuarios">
      <DialogTrigger asChild><button type="button" data-testid="presence-widget-trigger" aria-label="Ver usuarios en línea" title="Usuarios en línea" className="flex size-11 items-center justify-center rounded-full border border-border/80 bg-card/95 text-primary shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"><Users className="size-5" /></button></DialogTrigger>
    </FloatingActionContainer>
    {open && <PresencePanel owner={owner} />}
  </Dialog>
}

export function PresenceFeature() {
  const token = useSessionStore((state) => state.token)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const owner = getAccessTokenSubject(token)
  if (!owner) return null
  return <>
    <PresenceHeartbeat key={`signal:${owner}`} owner={owner} />
    {pathname === '/dashboard' && getAccessTokenRole(token) === 'admin' && <AdminPresenceWidget key={owner} owner={owner} />}
  </>
}
