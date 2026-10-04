import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileSignature, Layers } from 'lucide-react'
import {
  collabKeys,
  type Project,
  type ProjectContract,
  type ProjectMember,
} from '@/features/collab/model'
import { listProjectContractAmendmentsRequest } from '@/features/collab/api'
import { generateContractPreviewText } from '@/features/collab/lib/contract-parser'
import { COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS } from './collab-workspace-layout'
import { ContractClientSignature } from './contract-client-signature'
import { ContractDocumentReader } from './contract-document-reader'
import { ContractEditor } from './contract-editor'
import { ContractAmendmentsList } from './contract-amendments-list'
import { ContractLegalTraceability } from './contract-legal-traceability'
import { formatMoney } from './contract-editor-constants'

type Props = {
  accessToken: string
  project: Project | null
  contract: ProjectContract | null
  members: ProjectMember[]
  role: 'admin' | 'worker' | 'client'
  onError: (message: string) => void
}

const statusCopy: Record<ProjectContract['status'], { label: string; className: string }> = {
  draft: {
    label: 'Borrador',
    className:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 ' +
      'dark:text-amber-300 dark:border-amber-800',
  },
  pending_signature: {
    label: 'Pendiente de firma',
    className:
      'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 ' +
      'dark:text-sky-300 dark:border-sky-800',
  },
  signed: {
    label: 'Firmado',
    className:
      'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 ' +
      'dark:text-emerald-300 dark:border-emerald-800',
  },
}

export function ContractPanel({
  accessToken,
  project,
  contract,
  members,
  role,
  onError,
}: Props) {
  const [activeTab, setActiveTab] = useState<'contract' | 'amendments'>('contract')
  const [isClientViewingSeal, setIsClientViewingSeal] = useState(false)

  const { data: amendments = [] } = useQuery({
    queryKey: collabKeys.contractAmendments(project?.id ?? ''),
    queryFn: async () => {
      if (!project?.id) return []
      const res = await listProjectContractAmendmentsRequest(accessToken, project.id)
      return res.data ?? []
    },
    enabled: Boolean(project?.id && contract?.status === 'signed'),
  })

  if (!project) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
        Cargando proyecto…
      </div>
    )
  }

  if (!contract) {
    return role === 'admin' ? (
      <div data-tour="workspace-contract-content">
        <ContractEditor
          key="new"
          accessToken={accessToken}
          project={project}
          contract={null}
          members={members}
          onError={onError}
        />
      </div>
    ) : (
      <div
        data-tour="workspace-contract-content"
        className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground"
      >
        El administrador aún no ha preparado un contrato para este proyecto.
      </div>
    )
  }

  if (contract.status === 'draft' && role === 'admin') {
    return (
      <div data-tour="workspace-contract-content">
        <ContractEditor
          key={contract.id}
          accessToken={accessToken}
          project={project}
          contract={contract}
          members={members}
          onError={onError}
        />
      </div>
    )
  }

  const badge = statusCopy[contract.status]
  const isClientSigning =
    (contract.status === 'pending_signature' || isClientViewingSeal) && role === 'client'

  return (
    <section
      data-tour="workspace-contract-content"
      className={
        `flex ${COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS} min-w-0 flex-col overflow-hidden ` +
        'rounded-xl border border-border/70 bg-card shadow-2xs'
      }
    >
      <div
        className={[
          'flex flex-wrap items-center justify-between gap-3 border-b border-border/60',
          'bg-muted/20 px-5 py-3.5 shrink-0',
        ].join(' ')}
      >
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground tracking-tight">
            <FileSignature className="size-4 text-primary" />
            Contrato del proyecto
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {contract.planName} · {formatMoney(contract.monthlyFee)} / mes · {contract.termMonths} meses
          </p>
        </div>

        <div className="flex items-center gap-3">
          {contract.status === 'signed' && (
            <div className="flex items-center rounded-xl bg-muted/70 p-1 border border-border/50 text-xs">
              <button
                type="button"
                className={[
                  'flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-colors cursor-pointer',
                  activeTab === 'contract'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
                onClick={() => setActiveTab('contract')}
              >
                <FileSignature className="size-3.5" />
                Contrato Principal
              </button>
              <button
                type="button"
                className={[
                  'flex items-center gap-1.5 rounded-lg px-3 py-1 font-medium transition-colors cursor-pointer',
                  activeTab === 'amendments'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')}
                onClick={() => setActiveTab('amendments')}
              >
                <Layers className="size-3.5" />
                Otrosíes y Adiciones
                {amendments.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {amendments.length}
                  </span>
                )}
              </button>
            </div>
          )}

          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold shadow-2xs ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {activeTab === 'amendments' && contract.status === 'signed' ? (
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          <ContractAmendmentsList
            accessToken={accessToken}
            projectId={project.id}
            projectName={project.name}
            contract={contract}
            role={role}
            onError={onError}
          />
        </div>
      ) : (
        <div
          className={[
            'min-h-0 flex-1 grid gap-4 p-4 overflow-y-auto lg:overflow-hidden',
            'lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,24rem)]',
          ].join(' ')}
        >
          <div className="h-[24rem] lg:h-full min-h-0 overflow-y-auto pr-1">
            <ContractDocumentReader
              content={
                contract.contentSnapshot ||
                generateContractPreviewText(contract, project.name)
              }
            />
          </div>

          {isClientSigning ? (
            <ContractClientSignature
              accessToken={accessToken}
              projectId={project.id}
              projectName={project.name}
              contract={contract}
              onError={onError}
              onSealComplete={() => setIsClientViewingSeal(true)}
              onDismissSeal={() => setIsClientViewingSeal(false)}
            />
          ) : (
            <ContractLegalTraceability
              contract={contract}
              projectName={project.name}
              onError={onError}
            />
          )}
        </div>
      )}
    </section>
  )
}
