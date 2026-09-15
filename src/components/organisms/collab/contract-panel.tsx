import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, FileSignature, PenLine, RotateCcw, Send, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { collabKeys, type Project, type ProjectContract, type ProjectMember } from '@/features/collab/model'
import { requestProjectContractSignatureRequest, saveProjectContractDraftRequest, signProjectContractRequest, type ProjectContractDraftInput } from '@/features/collab/api'
import { parseApiError } from '@/shared/lib'
import { downloadSignedContractPdf } from '@/features/collab/lib/contract-pdf'

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
  pending_signature: { label: 'Pendiente de firma', className: 'bg-sky-100 text-sky-800 border-sky-200' },
  signed: { label: 'Firmado', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
}

const formatMoney = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)

const SERVICE_PLANS = [
  { name: 'Platinum', baseFee: 1_300_000, scope: '12 publicaciones mensuales.' },
  { name: 'Oro', baseFee: 1_800_000, scope: '20 publicaciones mensuales y 1 video profesional.' },
  { name: 'Diamante', baseFee: 2_400_000, scope: '24 publicaciones mensuales, 1 video profesional y 10 fotografías de producto.' },
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
    provider_kind: 'cima', provider_name: CIMA_PROVIDER.name, provider_tax_id: CIMA_PROVIDER.taxId, provider_representative: CIMA_PROVIDER.representative, provider_representative_document: CIMA_PROVIDER.representativeDocument,
    client_kind: client?.client_kind ?? 'natural', client_name: client?.company_name || project.clientName, client_document: '', client_company_name: client?.company_name || '', client_tax_id: '', client_representative: '', client_representative_document: '', client_email: client?.email || '', client_phone: '',
    plan_name: SERVICE_PLANS[0].name, monthly_fee: Math.round(SERVICE_PLANS[0].baseFee * 1.19), currency: 'COP', tax_included: true, term_months: 6,
    service_scope: SERVICE_PLANS[0].scope, additional_terms: '', signature_city: 'Bogotá, D.C.',
  }
}

function toDraft(contract: ProjectContract): ProjectContractDraftInput {
  return {
    provider_kind: contract.providerKind, provider_name: contract.providerName, provider_tax_id: contract.providerTaxId, provider_representative: contract.providerRepresentative, provider_representative_document: contract.providerRepresentativeDocument,
    client_kind: contract.clientKind, client_name: contract.clientName, client_document: contract.clientDocument, client_company_name: contract.clientCompanyName, client_tax_id: contract.clientTaxId, client_representative: contract.clientRepresentative, client_representative_document: contract.clientRepresentativeDocument, client_email: contract.clientEmail, client_phone: contract.clientPhone,
    plan_name: contract.planName, monthly_fee: contract.monthlyFee, currency: 'COP', tax_included: contract.taxIncluded, term_months: contract.termMonths, service_scope: contract.serviceScope, additional_terms: contract.additionalTerms, signature_city: contract.signatureCity,
  }
}

function SignaturePad({ onChange }: { onChange: (value: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) }
  }
  const draw = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.lineCap = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = '#171717'; ctx.stroke()
  }
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    const current = point(event)
    drawingRef.current = true
    ;(event.currentTarget as HTMLCanvasElement & { lastPoint?: { x: number; y: number } }).lastPoint = current
  }
  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const canvas = event.currentTarget as HTMLCanvasElement & { lastPoint?: { x: number; y: number } }
    const next = point(event)
    if (canvas.lastPoint) draw(canvas.lastPoint, next)
    canvas.lastPoint = next
    setHasSignature(true)
  }
  const finish = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    onChange(canvasRef.current?.toDataURL('image/png') ?? null)
  }
  const clear = () => {
    const canvas = canvasRef.current
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false); onChange(null)
  }
  return <div className="space-y-2">
    <canvas ref={canvasRef} width={720} height={180} className="h-32 w-full touch-none rounded-lg border bg-white" aria-label="Área para firmar" onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onPointerLeave={finish} />
    <div className="flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Firma con mouse o dedo.</p><Button type="button" variant="outline" size="sm" onClick={clear} disabled={!hasSignature}><RotateCcw className="size-3.5" /> Limpiar</Button></div>
  </div>
}

function ContractEditor({ accessToken, project, contract, members, onError }: Omit<Props, 'role'>) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<ProjectContractDraftInput>(() => contract ? toDraft(contract) : defaultDraft(project!, members))
  const set = <K extends keyof ProjectContractDraftInput>(key: K, value: ProjectContractDraftInput[K]) => setValues((previous) => ({ ...previous, [key]: value }))
  const setProvider = (providerKind: 'cima' | 'independent') => {
    const provider = providerKind === 'cima' ? CIMA_PROVIDER : INDEPENDENT_PROVIDER
    const selectedPlan = SERVICE_PLANS.find((plan) => plan.name === values.plan_name) ?? SERVICE_PLANS[0]
    setValues((previous) => ({
      ...previous,
      provider_kind: providerKind,
      provider_name: provider.name,
      provider_tax_id: provider.taxId,
      provider_representative: providerKind === 'cima' ? CIMA_PROVIDER.representative : '',
      provider_representative_document: providerKind === 'cima' ? CIMA_PROVIDER.representativeDocument : '',
      tax_included: providerKind === 'cima',
      monthly_fee: providerKind === 'cima' ? Math.round(selectedPlan.baseFee * 1.19) : selectedPlan.baseFee,
    }))
  }
  const choosePlan = (plan: typeof SERVICE_PLANS[number]) => setValues((previous) => ({
    ...previous,
    plan_name: plan.name,
    monthly_fee: previous.provider_kind === 'cima' ? Math.round(plan.baseFee * 1.19) : plan.baseFee,
    tax_included: previous.provider_kind === 'cima',
    service_scope: plan.scope,
  }))
  const save = useMutation({ mutationFn: () => saveProjectContractDraftRequest(accessToken, project!.id, values), onSuccess: () => void queryClient.invalidateQueries({ queryKey: collabKeys.contract(project!.id) }), onError: (error) => void parseApiError(error).then((message) => onError(message || 'No se pudo guardar el borrador')) })
  const send = useMutation({ mutationFn: () => requestProjectContractSignatureRequest(accessToken, project!.id), onSuccess: () => void queryClient.invalidateQueries({ queryKey: collabKeys.contract(project!.id) }), onError: (error) => void parseApiError(error).then((message) => onError(message || 'No se pudo solicitar la firma')) })
  const busy = save.isPending || send.isPending

  return <div className="grid gap-4 min-[1280px]:grid-cols-[minmax(0,1fr)_minmax(20rem,0.55fr)]">
    <section className="rounded-xl border bg-card shadow-sm"><div className="border-b px-4 py-3"><h3 className="text-sm font-semibold">Preparar contrato</h3><p className="mt-0.5 text-xs text-muted-foreground">Completa los datos que quedarán congelados al habilitar la firma.</p></div><div className="space-y-5 p-4">
      <div><h4 className="mb-3 text-sm font-semibold">Prestador del servicio</h4><div className="grid gap-3 sm:grid-cols-2"><Field label="Modalidad"><select className="h-9 w-full rounded-lg border bg-background px-2 text-sm" value={values.provider_kind} onChange={(event) => setProvider(event.target.value as 'cima' | 'independent')}><option value="cima">CIMA (con IVA)</option><option value="independent">Ander (sin IVA)</option></select></Field><Field label="Nombre o razón social"><Input value={values.provider_name} onChange={(event) => set('provider_name', event.target.value)} /></Field><Field label="NIT o documento"><Input value={values.provider_tax_id ?? ''} onChange={(event) => set('provider_tax_id', event.target.value)} /></Field><Field label="Representante legal"><Input value={values.provider_representative ?? ''} onChange={(event) => set('provider_representative', event.target.value)} /></Field>{values.provider_kind === 'cima' && <Field label="Documento del representante"><Input value={values.provider_representative_document ?? ''} onChange={(event) => set('provider_representative_document', event.target.value)} /></Field>}</div></div>
      <div className="border-t pt-5"><h4 className="mb-3 text-sm font-semibold">Cliente que firmará</h4><div className="grid gap-3 sm:grid-cols-2"><Field label="Tipo de cliente"><select className="h-9 w-full rounded-lg border bg-background px-2 text-sm" value={values.client_kind} onChange={(event) => set('client_kind', event.target.value as 'natural' | 'juridical')}><option value="natural">Persona natural</option><option value="juridical">Persona jurídica</option></select></Field><Field label={values.client_kind === 'juridical' ? 'Razón social' : 'Nombre completo'}><Input value={values.client_kind === 'juridical' ? values.client_company_name ?? '' : values.client_name} onChange={(event) => set(values.client_kind === 'juridical' ? 'client_company_name' : 'client_name', event.target.value)} /></Field>{values.client_kind === 'juridical' ? <><Field label="NIT"><Input value={values.client_tax_id ?? ''} onChange={(event) => set('client_tax_id', event.target.value)} /></Field><Field label="Representante legal"><Input value={values.client_representative ?? ''} onChange={(event) => set('client_representative', event.target.value)} /></Field><Field label="Documento representante"><Input value={values.client_representative_document ?? ''} onChange={(event) => set('client_representative_document', event.target.value)} /></Field></> : <Field label="Cédula o documento"><Input value={values.client_document ?? ''} onChange={(event) => set('client_document', event.target.value)} /></Field>}<Field label="Correo electrónico"><Input type="email" value={values.client_email} onChange={(event) => set('client_email', event.target.value)} /></Field><Field label="Celular"><Input value={values.client_phone ?? ''} onChange={(event) => set('client_phone', event.target.value)} /></Field></div></div>
      <div className="border-t pt-5"><h4 className="mb-3 text-sm font-semibold">Plan y condiciones</h4><div className="grid gap-3 md:grid-cols-3">{SERVICE_PLANS.map((plan) => <button type="button" key={plan.name} onClick={() => choosePlan(plan)} className={`rounded-xl border p-3 text-left transition-all duration-150 cursor-pointer active:scale-[0.98] ${values.plan_name === plan.name ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs' : 'hover:border-primary/50 hover:bg-muted/30'}`}><p className="font-semibold">{plan.name}</p><p className="mt-1 text-base font-bold">{formatMoney(values.provider_kind === 'cima' ? Math.round(plan.baseFee * 1.19) : plan.baseFee)}<span className="ml-1 text-xs font-normal">/ mes</span></p><p className="mt-2 text-xs text-muted-foreground">{plan.scope}</p></button>)}</div><p className="mt-2 text-xs text-muted-foreground">{values.provider_kind === 'cima' ? 'Valores con IVA del 19% incluido.' : 'Valores sin IVA.'}</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Valor mensual (COP)"><Input type="number" min="0" value={values.monthly_fee} onChange={(event) => set('monthly_fee', Number(event.target.value))} /></Field><Field label="Plazo del contrato"><div className="flex h-9 items-center gap-2"><Button type="button" size="sm" variant={values.term_months === 6 ? 'default' : 'outline'} onClick={() => set('term_months', 6)}>6 meses</Button><Button type="button" size="sm" variant={values.term_months === 12 ? 'default' : 'outline'} onClick={() => set('term_months', 12)}>1 año</Button><Input className="w-20" type="number" min="1" max="120" value={values.term_months} onChange={(event) => set('term_months', Number(event.target.value))} /></div></Field></div><Field label="Alcance del servicio" className="mt-3"><Textarea value={values.service_scope} onChange={(event) => set('service_scope', event.target.value)} /></Field><Field label="Condiciones adicionales (opcional)" className="mt-3"><Textarea value={values.additional_terms ?? ''} onChange={(event) => set('additional_terms', event.target.value)} /></Field><Field label="Ciudad de firma" className="mt-3"><Input value={values.signature_city} onChange={(event) => set('signature_city', event.target.value)} /></Field></div>
    </div></section>
    <aside className="rounded-xl border bg-card shadow-sm"><div className="border-b px-4 py-3"><h3 className="text-sm font-semibold">Resumen</h3><p className="mt-0.5 text-xs text-muted-foreground">Revisa antes de habilitar la firma.</p></div><div className="space-y-4 p-4 text-sm"><div><p className="text-muted-foreground">Proyecto</p><p className="font-medium">{project!.name}</p></div><div><p className="text-muted-foreground">Plan</p><p className="font-medium">{values.plan_name}</p><p>{formatMoney(values.monthly_fee)} / mes · {values.term_months} meses</p></div><div><p className="text-muted-foreground">Firmante</p><p className="font-medium">{values.client_kind === 'juridical' ? values.client_representative || 'Pendiente' : values.client_name}</p><p className="truncate text-xs">{values.client_email || 'Correo pendiente'}</p></div><div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><ShieldCheck className="mb-1 size-4" /> Al habilitar la firma, el contenido y sus datos quedan bloqueados para proteger la evidencia.</div><Button className="w-full" variant="outline" onClick={() => save.mutate()} disabled={busy}>{save.isPending ? 'Guardando…' : 'Guardar borrador'}</Button><Button className="w-full" onClick={() => send.mutate()} disabled={busy || !contract}><Send className="size-4" /> {send.isPending ? 'Habilitando…' : 'Habilitar firma del cliente'}</Button>{!contract && <p className="text-center text-xs text-muted-foreground">Guarda el borrador antes de habilitar la firma.</p>}</div></aside>
  </div>
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) { return <div className={className}><Label className="mb-1.5">{label}</Label>{children}</div> }

function ClientSignature({ accessToken, projectId, contract, onError }: { accessToken: string; projectId: string; contract: ProjectContract; onError: (message: string) => void }) {
  const queryClient = useQueryClient(); const [signature, setSignature] = useState<string | null>(null); const [accepted, setAccepted] = useState(false); const [name, setName] = useState(contract.clientRepresentative || contract.clientName)
  const sign = useMutation({ mutationFn: () => signProjectContractRequest(accessToken, projectId, { signer_name: name, signature_data_url: signature!, accept_terms: true }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: collabKeys.contract(projectId) }), onError: (error) => void parseApiError(error).then((message) => onError(message || 'No se pudo registrar la firma')) })
  return <section className="mx-auto max-w-3xl rounded-xl border bg-card shadow-sm"><div className="border-b px-5 py-4"><h3 className="flex items-center gap-2 font-semibold"><PenLine className="size-4 text-primary" /> Firma del cliente</h3><p className="mt-1 text-sm text-muted-foreground">Revisa el documento, acepta sus términos y firma para dejar constancia.</p></div><div className="space-y-4 p-5"><Field label="Nombre de quien firma"><Input value={name} onChange={(event) => setName(event.target.value)} /></Field><SignaturePad onChange={setSignature} /><div className="flex items-start gap-2"><Checkbox id="contract-consent" checked={accepted} onCheckedChange={(checked) => setAccepted(checked === true)} /><Label htmlFor="contract-consent" className="leading-5">Declaro que leí, comprendí y acepto el contrato mostrado. Autorizo el uso de esta firma electrónica como evidencia de mi aceptación.</Label></div><Button className="w-full" onClick={() => sign.mutate()} disabled={!signature || !accepted || name.trim().length < 2 || sign.isPending}><FileSignature className="size-4" /> {sign.isPending ? 'Registrando firma…' : 'Firmar contrato'}</Button></div></section>
}

export function ContractPanel({ accessToken, project, contract, members, role, onError }: Props) {
  if (!project) return <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">Cargando proyecto…</div>
  if (!contract) return role === 'admin' ? <ContractEditor key="new" accessToken={accessToken} project={project} contract={null} members={members} onError={onError} /> : <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">El administrador aún no ha preparado un contrato para este proyecto.</div>
  const badge = statusCopy[contract.status]
  return <div className="space-y-4"><section className="rounded-xl border bg-card shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"><div><h3 className="flex items-center gap-2 text-sm font-semibold"><FileSignature className="size-4 text-primary" /> Contrato del proyecto</h3><p className="mt-0.5 text-xs text-muted-foreground">{contract.planName} · {formatMoney(contract.monthlyFee)} / mes · {contract.termMonths} meses</p></div><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span></div><div className="grid gap-4 p-4 min-[1280px]:grid-cols-[minmax(0,1fr)_18rem]"><article className="max-h-[32rem] overflow-y-auto rounded-lg border bg-muted/20 p-4 whitespace-pre-wrap text-sm leading-6">{contract.contentSnapshot || 'Este borrador se convertirá en un documento inmutable cuando se habilite la firma.'}</article><aside className="space-y-3 rounded-lg border p-4 text-sm"><p className="font-medium">Trazabilidad</p><p className="text-muted-foreground">Preparado: {new Date(contract.createdAt).toLocaleString('es')}</p>{contract.requestedSignatureAt && <p className="text-muted-foreground">Habilitado: {new Date(contract.requestedSignatureAt).toLocaleString('es')}</p>}{contract.signedAt && <><p className="text-muted-foreground">Firmado: {new Date(contract.signedAt).toLocaleString('es')}</p><p className="font-medium">{contract.signerName}</p>{contract.signatureDataUrl && <img src={contract.signatureDataUrl} alt="Firma registrada" className="h-16 w-full rounded border bg-white object-contain" />}{contract.contentHash && <p className="break-all text-[10px] text-muted-foreground">SHA-256: {contract.contentHash}</p>}</>} {contract.status === 'signed' && <Button className="w-full" variant="outline" onClick={() => void downloadSignedContractPdf(contract, project.name).catch((error) => onError(error instanceof Error ? error.message : 'No se pudo generar el PDF'))}><CheckCircle2 className="size-4" /> Descargar PDF firmado</Button>}</aside></div></section>{contract.status === 'draft' && role === 'admin' && <ContractEditor key={contract.id} accessToken={accessToken} project={project} contract={contract} members={members} onError={onError} />}{contract.status === 'pending_signature' && role === 'client' && <ClientSignature accessToken={accessToken} projectId={project.id} contract={contract} onError={onError} />}</div>
}
