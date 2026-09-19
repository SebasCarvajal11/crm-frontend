import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { collabKeys, type Project, type ProjectContract, type ProjectMember } from '@/features/collab/model'
import {
  requestProjectContractSignatureRequest,
  saveProjectContractDraftRequest,
  type ProjectContractDraftInput,
} from '@/features/collab/api'
import { parseApiError } from '@/shared/lib'
import { generateContractPreviewText } from '@/features/collab/lib/contract-parser'
import { ContractDocumentReader } from './contract-document-reader'
import { ContractEditorForm } from './contract-editor-form'
import { ContractEditorSummary } from './contract-editor-summary'
import {
  SERVICE_PLANS,
  CIMA_PROVIDER,
  INDEPENDENT_PROVIDER,
  defaultDraft,
  toDraft,
} from './contract-editor-constants'

type Props = {
  accessToken: string
  project: Project
  contract: ProjectContract | null
  members: ProjectMember[]
  onError: (message: string) => void
}

export function ContractEditor({
  accessToken,
  project,
  contract,
  members,
  onError,
}: Props) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<ProjectContractDraftInput>(() =>
    contract ? toDraft(contract) : defaultDraft(project, members),
  )
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form')

  const set = <K extends keyof ProjectContractDraftInput>(
    key: K,
    value: ProjectContractDraftInput[K],
  ) => setValues((previous) => ({ ...previous, [key]: value }))

  const setProvider = (providerKind: 'cima' | 'independent') => {
    const provider = providerKind === 'cima' ? CIMA_PROVIDER : INDEPENDENT_PROVIDER
    const selectedPlan =
      SERVICE_PLANS.find((plan) => plan.name === values.plan_name) ?? SERVICE_PLANS[0]
    setValues((previous) => ({
      ...previous,
      provider_kind: providerKind,
      provider_name: provider.name,
      provider_tax_id: provider.taxId,
      provider_representative: providerKind === 'cima' ? CIMA_PROVIDER.representative : '',
      provider_representative_document:
        providerKind === 'cima' ? CIMA_PROVIDER.representativeDocument : '',
      tax_included: providerKind === 'cima',
      monthly_fee:
        providerKind === 'cima'
          ? Math.round(selectedPlan.baseFee * 1.19)
          : selectedPlan.baseFee,
    }))
  }

  const choosePlan = (plan: (typeof SERVICE_PLANS)[number]) =>
    setValues((previous) => ({
      ...previous,
      plan_name: plan.name,
      monthly_fee:
        previous.provider_kind === 'cima'
          ? Math.round(plan.baseFee * 1.19)
          : plan.baseFee,
      tax_included: previous.provider_kind === 'cima',
      service_scope: plan.scope,
    }))

  const save = useMutation({
    mutationFn: () => saveProjectContractDraftRequest(accessToken, project.id, values),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: collabKeys.contract(project.id) }),
    onError: (error) =>
      void parseApiError(error).then((msg) => onError(msg || 'No se pudo guardar el borrador')),
  })

  const send = useMutation({
    mutationFn: () => requestProjectContractSignatureRequest(accessToken, project.id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: collabKeys.contract(project.id) }),
    onError: (error) =>
      void parseApiError(error).then((msg) => onError(msg || 'No se pudo solicitar la firma')),
  })

  const busy = save.isPending || send.isPending
  const previewText = generateContractPreviewText(values, project.name)

  return (
    <div className="grid gap-4 min-[1280px]:grid-cols-[minmax(0,1fr)_minmax(20rem,0.55fr)]">
      <section className="rounded-xl border bg-card shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">Preparar contrato</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Completa los datos que quedarán congelados al habilitar la firma.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                activeTab === 'form'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('form')}
            >
              Formulario
            </button>
            <button
              type="button"
              className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('preview')}
            >
              Vista previa
            </button>
          </div>
        </div>

        {activeTab === 'preview' ? (
          <div className="p-4 max-h-[calc(100vh-20rem)] overflow-y-auto">
            <ContractDocumentReader content={previewText} />
          </div>
        ) : (
          <ContractEditorForm
            values={values}
            onChange={set}
            onProviderChange={setProvider}
            onPlanChange={choosePlan}
          />
        )}
      </section>

      <ContractEditorSummary
        projectName={project.name}
        values={values}
        hasContract={Boolean(contract)}
        busy={busy}
        isSaving={save.isPending}
        isSending={send.isPending}
        onSave={() => save.mutate()}
        onSend={() => send.mutate()}
      />
    </div>
  )
}
