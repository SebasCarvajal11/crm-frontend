import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateProjectModal } from '@/components/organisms/collab/create-project-modal'
import { searchClientsRequest } from '@/features/auth/api'
import { parseApiError } from '@/shared/lib'
import { cn } from '@/shared/lib/utils'
import { listClientsRequest } from '../api/clients-api'
import { listProposalsRequest } from '../api/proposals-api'
import { linkProposalProjectRequest } from '../api/commercial-api'

export interface ProposalForProject {
  proposalId: number
  title: string
  description?: string | null
  clientId: string
  clientName: string
}

interface CreateProjectFromProposalProps {
  accessToken: string
  proposal: ProposalForProject
  className?: string
  size?: 'sm' | 'default'
  /** Para el tour: solo el primer botón lleva data-tour. */
  dataTour?: string
}

/**
 * Botón "Crear proyecto en CIMAxios" para una propuesta aprobada sin proyecto
 * (solo admin). Abre el formulario de proyecto de Colaboración precargado y, al
 * crearlo, vincula la propuesta con PATCH /proposals/{id}/project.
 */
export function CreateProjectFromProposal({
  accessToken,
  proposal,
  className,
  size = 'sm',
  dataTour,
}: CreateProjectFromProposalProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // El clientId de marketing es el client_sub de CIMAxios; la búsqueda de usuarios es por correo.
  const clientsQuery = useQuery({
    queryKey: ['marketing', 'clients'],
    queryFn: () => listClientsRequest(accessToken),
    enabled: open,
  })
  const email =
    (Array.isArray(clientsQuery.data) ? clientsQuery.data : []).find((c) => c.clientId === proposal.clientId)
      ?.contactInfo?.trim() ?? ''
  const userQuery = useQuery({
    queryKey: ['client-prefill', proposal.clientId, email],
    queryFn: () => searchClientsRequest(accessToken, email, 'client'),
    enabled: open && email.length >= 2,
    staleTime: 60_000,
  })
  const client = userQuery.data?.data?.find((u) => u.subject === proposal.clientId) ?? null
  // Desde el panel Hoy no llega la descripción: se toma de la lista de propuestas.
  const proposalsQuery = useQuery({
    queryKey: ['marketing', 'proposals'],
    queryFn: () => listProposalsRequest(accessToken),
    enabled: open && proposal.description === undefined,
  })
  const description =
    proposal.description ??
    (Array.isArray(proposalsQuery.data) ? proposalsQuery.data : []).find((p) => p.proposalId === proposal.proposalId)
      ?.description ??
    proposal.title
  const clientLoading = open && (clientsQuery.isLoading || (email.length >= 2 && userQuery.isLoading))

  const linkMutation = useMutation({
    mutationFn: (projectId: string) => linkProposalProjectRequest(accessToken, proposal.proposalId, projectId),
    onSuccess: () => {
      setError(null)
      for (const key of ['proposals', 'today', 'funnel', 'timeline']) {
        void queryClient.invalidateQueries({ queryKey: ['marketing', key] })
      }
      void queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
    onError: async (e) =>
      setError(
        `El proyecto se creó, pero no se pudo vincular con la propuesta: ${await parseApiError(e)}`
      ),
  })

  return (
    <>
      <Button
        type="button"
        size={size}
        className={cn('gap-1.5 text-xs', className)}
        onClick={() => {
          setError(null)
          setOpen(true)
        }}
        disabled={linkMutation.isPending}
        data-tour={dataTour}
      >
        <FolderKanban className="size-3.5" />
        {linkMutation.isPending ? 'Vinculando…' : 'Crear proyecto en CIMAxios'}
      </Button>
      {error && (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
      <CreateProjectModal
        accessToken={accessToken}
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(projectId) => linkMutation.mutate(projectId)}
        initialValues={{
          name: proposal.title,
          description,
          clientSub: proposal.clientId,
          clientName: proposal.clientName,
          client,
          clientLoading,
          sourceLabel: `Desde la propuesta aprobada #${proposal.proposalId}`,
        }}
      />
    </>
  )
}
