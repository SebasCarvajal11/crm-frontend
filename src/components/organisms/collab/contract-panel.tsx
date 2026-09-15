import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, FileSignature, Send, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { collabKeys, type Project, type ProjectContract, type ProjectMember } from '@/features/collab/model'
import {
  requestProjectContractSignatureRequest,
  saveProjectContractDraftRequest,
  type ProjectContractDraftInput,
} from '@/features/collab/api'
import { parseApiError } from '@/shared/lib'
import { downloadSignedContractPdf } from '@/features/collab/lib/contract-pdf'
import { generateContractPreviewText } from '@/features/collab/lib/contract-parser'
import { COLLAB_WORKSPACE_PANEL_HEIGHT_CLASS } from './collab-workspace-layout'
import { ContractClientSignature } from './contract-client-signature'
import { ContractDocumentReader } from './contract-document-reader'

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

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)

const SERVICE_PLANS = [
  { name: 'Platinum', baseFee: 1_300_000, scope: '12 publicaciones mensuales.' },
  { name: 'Oro', baseFee: 1_800_000, scope: '20 publicaciones mensuales y 1 video profesional.' },
  {
    name: 'Diamante',
    baseFee: 2_400_000,
    scope: '24 publicaciones mensuales, 1 video profesional y 10 fotografías de producto.',
  },
] as const

const CIMA_PROVIDER = {
  name: 'CIMA — Centro de Innovación Multimedia y Artística',
  taxId: '901.763.191-0',
  representative: 'Annyul Vianney Moreno Ospina',
  representativeDocument: '1.032.413.946',
} as const

const INDEPENDENT_PROVIDER = {
  name: 'Anderson Darley Giraldo Jutinico',
  taxId: '1.024.517.021',
} as const

function defaultDraft(project: Project, members: ProjectMember[]): ProjectContractDraftInput {
  const client = members.find((member) => member.role === 'client')
  return {
    provider_kind: 'cima',
    provider_name: CIMA_PROVIDER.name,
    provider_tax_id: CIMA_PROVIDER.taxId,
    provider_representative: CIMA_PROVIDER.representative,
    provider_representative_document: CIMA_PROVIDER.representativeDocument,
    client_kind: client?.client_kind ?? 'natural',
    client_name: client?.company_name || project.clientName,
    client_document: '',
    client_company_name: client?.company_name || '',
    client_tax_id: '',
    client_representative: '',
    client_representative_document: '',
    client_email: client?.email || '',
    client_phone: '',
    plan_name: SERVICE_PLANS[0].name,
    monthly_fee: Math.round(SERVICE_PLANS[0].baseFee * 1.19),
    currency: 'COP',
    tax_included: true,
    term_months: 6,
    service_scope: SERVICE_PLANS[0].scope,
    additional_terms: '',
    signature_city: 'Bogotá, D.C.',
  }
}

function toDraft(contract: ProjectContract): ProjectContractDraftInput {
  return {
    provider_kind: contract.providerKind,
    provider_name: contract.providerName,
    provider_tax_id: contract.providerTaxId,
    provider_representative: contract.providerRepresentative,
    provider_representative_document: contract.providerRepresentativeDocument,
    client_kind: contract.clientKind,
    client_name: contract.clientName,
    client_document: contract.clientDocument,
    client_company_name: contract.clientCompanyName,
    client_tax_id: contract.clientTaxId,
    client_representative: contract.clientRepresentative,
    client_representative_document: contract.clientRepresentativeDocument,
    client_email: contract.clientEmail,
    client_phone: contract.clientPhone,
    plan_name: contract.planName,
    monthly_fee: contract.monthlyFee,
    currency: 'COP',
    tax_included: contract.taxIncluded,
    term_months: contract.termMonths,
    service_scope: contract.serviceScope,
    additional_terms: contract.additionalTerms,
    signature_city: contract.signatureCity,
  }
}

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-foreground">{label}</Label>
      {children}
    </div>
  )
}

function ContractEditor({
  accessToken,
  project,
  contract,
  members,
  onError,
}: Omit<Props, 'role'>) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<ProjectContractDraftInput>(() =>
    contract ? toDraft(contract) : defaultDraft(project!, members),
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
    mutationFn: () => saveProjectContractDraftRequest(accessToken, project!.id, values),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: collabKeys.contract(project!.id) }),
    onError: (error) =>
      void parseApiError(error).then((msg) => onError(msg || 'No se pudo guardar el borrador')),
  })

  const send = useMutation({
    mutationFn: () => requestProjectContractSignatureRequest(accessToken, project!.id),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: collabKeys.contract(project!.id) }),
    onError: (error) =>
      void parseApiError(error).then((msg) => onError(msg || 'No se pudo solicitar la firma')),
  })

  const busy = save.isPending || send.isPending
  const previewText = generateContractPreviewText(values, project!.name)

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
          <div className="space-y-5 p-4">
          <div>
            <h4 className="mb-3 text-sm font-semibold">Prestador del servicio</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Modalidad">
                <select
                  className="h-9 w-full rounded-lg border bg-background px-2 text-sm"
                  value={values.provider_kind}
                  onChange={(e) => setProvider(e.target.value as 'cima' | 'independent')}
                >
                  <option value="cima">CIMA (con IVA)</option>
                  <option value="independent">Ander (sin IVA)</option>
                </select>
              </Field>
              <Field label="Nombre o razón social">
                <Input
                  value={values.provider_name}
                  onChange={(e) => set('provider_name', e.target.value)}
                />
              </Field>
              <Field label="NIT o documento">
                <Input
                  value={values.provider_tax_id ?? ''}
                  onChange={(e) => set('provider_tax_id', e.target.value)}
                />
              </Field>
              <Field label="Representante legal">
                <Input
                  value={values.provider_representative ?? ''}
                  onChange={(e) => set('provider_representative', e.target.value)}
                />
              </Field>
              {values.provider_kind === 'cima' && (
                <Field label="Documento del representante">
                  <Input
                    value={values.provider_representative_document ?? ''}
                    onChange={(e) => set('provider_representative_document', e.target.value)}
                  />
                </Field>
              )}
            </div>
          </div>

          <div className="border-t border-border/80 pt-5">
            <h4 className="mb-3 text-sm font-semibold">Cliente que firmará</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tipo de cliente">
                <select
                  className="h-9 w-full rounded-lg border bg-background px-2 text-sm"
                  value={values.client_kind}
                  onChange={(e) => set('client_kind', e.target.value as 'natural' | 'juridical')}
                >
                  <option value="natural">Persona natural</option>
                  <option value="juridical">Persona jurídica</option>
                </select>
              </Field>
              <Field label={values.client_kind === 'juridical' ? 'Razón social' : 'Nombre completo'}>
                <Input
                  value={values.client_kind === 'juridical' ? (values.client_company_name ?? '') : values.client_name}
                  onChange={(e) =>
                    set(values.client_kind === 'juridical' ? 'client_company_name' : 'client_name', e.target.value)
                  }
                />
              </Field>
              {values.client_kind === 'juridical' ? (
                <>
                  <Field label="NIT">
                    <Input
                      value={values.client_tax_id ?? ''}
                      onChange={(e) => set('client_tax_id', e.target.value)}
                    />
                  </Field>
                  <Field label="Representante legal">
                    <Input
                      value={values.client_representative ?? ''}
                      onChange={(e) => set('client_representative', e.target.value)}
                    />
                  </Field>
                  <Field label="Documento representante">
                    <Input
                      value={values.client_representative_document ?? ''}
                      onChange={(e) => set('client_representative_document', e.target.value)}
                    />
                  </Field>
                </>
              ) : (
                <Field label="Cédula o documento">
                  <Input
                    value={values.client_document ?? ''}
                    onChange={(e) => set('client_document', e.target.value)}
                  />
                </Field>
              )}
              <Field label="Correo electrónico">
                <Input
                  type="email"
                  value={values.client_email}
                  onChange={(e) => set('client_email', e.target.value)}
                />
              </Field>
              <Field label="Celular">
                <Input
                  value={values.client_phone ?? ''}
                  onChange={(e) => set('client_phone', e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-border/80 pt-5">
            <h4 className="mb-3 text-sm font-semibold">Plan y condiciones</h4>
            <div className="grid gap-3 md:grid-cols-3">
              {SERVICE_PLANS.map((plan) => {
                const isSelected = values.plan_name === plan.name
                const planFee = values.provider_kind === 'cima' ? Math.round(plan.baseFee * 1.19) : plan.baseFee
                return (
                  <button
                    type="button"
                    key={plan.name}
                    onClick={() => choosePlan(plan)}
                    className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                        : 'hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <p className="font-semibold text-sm">{plan.name}</p>
                    <p className="mt-1 text-base font-bold text-foreground">
                      {formatMoney(planFee)}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">/ mes</span>
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{plan.scope}</p>
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {values.provider_kind === 'cima' ? 'Valores con IVA del 19% incluido.' : 'Valores sin IVA.'}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Valor mensual (COP)">
                <Input
                  type="number"
                  min="0"
                  value={values.monthly_fee}
                  onChange={(e) => set('monthly_fee', Number(e.target.value))}
                />
              </Field>
              <Field label="Plazo del contrato">
                <div className="flex h-9 items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={values.term_months === 6 ? 'default' : 'outline'}
                    onClick={() => set('term_months', 6)}
                  >
                    6 meses
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={values.term_months === 12 ? 'default' : 'outline'}
                    onClick={() => set('term_months', 12)}
                  >
                    1 año
                  </Button>
                  <Input
                    className="w-20"
                    type="number"
                    min="1"
                    max="120"
                    value={values.term_months}
                    onChange={(e) => set('term_months', Number(e.target.value))}
                  />
                </div>
              </Field>
            </div>

            <Field label="Alcance del servicio" className="mt-3">
              <Textarea
                rows={3}
                value={values.service_scope}
                onChange={(e) => set('service_scope', e.target.value)}
              />
            </Field>

            <Field label="Condiciones adicionales (opcional)" className="mt-3">
              <Textarea
                rows={2}
                value={values.additional_terms ?? ''}
                onChange={(e) => set('additional_terms', e.target.value)}
              />
            </Field>

            <Field label="Ciudad de firma" className="mt-3">
              <Input
                value={values.signature_city}
                onChange={(e) => set('signature_city', e.target.value)}
              />
            </Field>
          </div>
        </div>
        )}
      </section>

      <aside className="rounded-xl border bg-card shadow-xs h-fit">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Resumen</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Revisa antes de habilitar la firma.</p>
        </div>

        <div className="space-y-4 p-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Proyecto</p>
            <p className="font-semibold text-foreground">{project!.name}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="font-semibold text-foreground">{values.plan_name}</p>
            <p className="text-xs text-muted-foreground">
              {formatMoney(values.monthly_fee)} / mes · {values.term_months} meses
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Firmante</p>
            <p className="font-semibold text-foreground">
              {values.client_kind === 'juridical'
                ? values.client_representative || 'Pendiente'
                : values.client_name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {values.client_email || 'Correo pendiente'}
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
            <ShieldCheck className="mb-1 size-4 text-amber-800" />
            Al habilitar la firma, el contenido y sus cláusulas quedan sellados de forma inmutable.
          </div>

          <Button
            className="w-full"
            variant="outline"
            onClick={() => save.mutate()}
            disabled={busy}
          >
            {save.isPending ? 'Guardando…' : 'Guardar borrador'}
          </Button>

          <Button
            className="w-full gap-1.5"
            onClick={() => send.mutate()}
            disabled={busy || !contract}
          >
            <Send className="size-4" />
            {send.isPending ? 'Habilitando…' : 'Habilitar firma del cliente'}
          </Button>

          {!contract && (
            <p className="text-center text-xs text-muted-foreground">
              Guarda el borrador antes de habilitar la firma.
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}

export function ContractPanel({
  accessToken,
  project,
  contract,
  members,
  role,
  onError,
}: Props) {
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
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

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
    </section>
  )
}
