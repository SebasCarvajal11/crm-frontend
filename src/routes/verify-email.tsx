import { createFileRoute } from '@tanstack/react-router'
import { VerifyEmailPage } from '@/pages/auth'

type VerifySearch = { token?: string }

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>): VerifySearch => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: VerifyEmailRoute,
})

function VerifyEmailRoute() {
  const { token } = Route.useSearch()
  return <VerifyEmailPage token={token} />
}

