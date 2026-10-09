import { createFileRoute } from '@tanstack/react-router'
import { AcceptInvitePage } from '@/pages/auth'

export const Route = createFileRoute('/accept-invite/$token')({
  component: AcceptInviteRoute,
})

function AcceptInviteRoute() {
  const { token } = Route.useParams()
  return <AcceptInvitePage token={token} />
}

