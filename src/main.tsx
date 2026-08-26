import { StrictMode } from 'react'
import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { isHTTPError } from 'ky'
import './index.css'

import { routeTree } from './routeTree.gen'
import { bootstrapSession, useSessionStore } from './app/session/session-store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      // Los 4xx representan una petición inválida o una decisión de autorización;
      // reintentarlos solo duplica tráfico y oculta la causa al usuario.
      retry: (failureCount, error) => {
        if (isHTTPError(error) && error.response.status >= 400 && error.response.status < 500) {
          return false
        }
        return failureCount < 1
      },
    },
    mutations: {
      retry: false,
    },
  },
})

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function AppBootstrap() {
  const bootstrapped = useSessionStore((s) => s.bootstrapped)

  useEffect(() => {
    void bootstrapSession()
  }, [])

  if (!bootstrapped) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="text-sm text-muted-foreground">Restaurando sesión…</div>
      </div>
    )
  }

  return <RouterProvider router={router} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppBootstrap />
    </QueryClientProvider>
  </StrictMode>,
)
