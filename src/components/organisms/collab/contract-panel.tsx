import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, FileSignature, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  collabKeys,
  type Project,
  type ProjectContract,
  type ProjectMember,
} from '@/features/collab/model'
import { listProjectContractAmendmentsRequest } from '@/features/collab/api'
import { downloadSignedContractPdf } from '@/features/collab/lib/contract-pdf'
import { generateContractPreviewText } from '@/features/collab/lib/contract-parser'
import { COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS } from './collab-workspace-layout'
import { ContractClientSignature } from './contract-client-signature'
import { ContractDocumentReader } from './contract-document-reader'
import { ContractEditor } from './contract-editor'
import { ContractAmendmentsList } from './contract-amendments-list'
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
  draft: { label: 'Borrador', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  pending_signature: {
    label: 'Pendiente de firma',
    className: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  signed: { label: 'Firmado', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
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
      <ContractEditor
        key="new"
        accessToken={accessToken}
        project={project}
        contract={null}
        members={members}
        onError={onError}
      />
    ) : (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
        El administrador aún no ha preparado un contrato para este proyecto.
      </div>
    )
  }

  if (contract.status === 'draft' && role === 'admin') {
    return (
      <ContractEditor
        key={contract.id}
        accessToken={accessToken}
        project={project}
        contract={contract}
        members={members}
        onError={onError}
      />
    )
  }

  const badge = statusCopy[contract.status]
  const isClientSigning = contract.status === 'pending_signature' && role === 'client'

  return (
    <section
      className={`flex ${COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS} min-w-0 flex-col overflow-hidden rounded-xl border bg-card shadow-xs`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/10 px-5 py-3.5 shrink-0">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileSignature className="size-4 text-primary" />
            Contrato del proyecto
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {contract.planName} · {formatMoney(contract.monthlyFee)} / mes · {contract.termMonths} meses
          </p>
        </div>

        <div className="flex items-center gap-3">
          {contract.status === 'signed' && (
            <div className="flex items-center rounded-lg bg-muted p-1 text-xs">
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors cursor-pointer ${
                  activeTab === 'contract'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('contract')}
              >
                <FileSignature className="size-3.5" />
                Contrato Principal
              </button>
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors cursor-pointer ${
                  activeTab === 'amendments'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab('amendments')}
              >
                <Layers className="size-3.5" />
                Otrosíes y Adiciones
                {amendments.length > 0 && (
                  <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                    {amendments.length}
                  </span>
                )}
              </button>
            </div>
          )}

          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
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
        <div className="min-h-0 flex-1 grid gap-4 p-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(20rem,24rem)] overflow-y-auto lg:overflow-hidden">
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
              contract={contract}
              onError={onError}
            />
          ) : (
            <aside className="flex flex-col rounded-xl border bg-card p-4 text-sm shadow-xs overflow-y-auto space-y-3">
              <p className="font-semibold text-foreground">Trazabilidad legal</p>
              <p className="text-xs text-muted-foreground">
                Preparado: {new Date(contract.createdAt).toLocaleString('es-CO')}
              </p>
              {contract.requestedSignatureAt && (
                <p className="text-xs text-muted-foreground">
                  Habilitado para firma: {new Date(contract.requestedSignatureAt).toLocaleString('es-CO')}
                </p>
              )}
              {contract.signedAt && (
                <>
                  <p className="text-xs text-muted-foreground">
                    Firmado: {new Date(contract.signedAt).toLocaleString('es-CO')}
                  </p>
                  <p className="text-xs font-medium text-foreground">Firmante: {contract.signerName}</p>
                  {contract.signatureDataUrl && (
                    <div className="rounded border bg-white p-2">
                      <img
                        src={contract.signatureDataUrl}
                        alt="Firma registrada"
                        className="h-16 w-full object-contain"
                      />
                    </div>
                  )}
                  {contract.contentHash && (
                    <p className="break-all text-[10px] text-muted-foreground font-mono bg-muted/40 p-2 rounded border">
                      SHA-256: {contract.contentHash}
                    </p>
                  )}
                </>
              )}

              {contract.status === 'signed' && (
                <Button
                  className="w-full gap-2 text-xs font-semibold mt-auto"
                  variant="outline"
                  onClick={() =>
                    void downloadSignedContractPdf(contract, project.name).catch((error) =>
                      onError(error instanceof Error ? error.message : 'No se pudo generar el PDF'),
                    )
                  }
                >
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Descargar PDF firmado
                </Button>
              )}
            </aside>
          )}
        </div>
      )}
    </section>
  )
}
