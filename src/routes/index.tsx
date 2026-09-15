import { createFileRoute, redirect } from '@tanstack/react-router'
import { useSessionStore } from '@/app/session/session-store'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const token = useSessionStore.getState().token
    if (token) {
      throw redirect({ to: '/dashboard' })
    }
    throw redirect({ to: '/login' })
  },
  component: () => null,
})

