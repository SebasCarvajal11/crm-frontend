import { CheckCircle2, Send, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ProjectContractDraftInput } from '@/features/collab/api'
import { getContractDraftChecklist } from '@/features/collab/lib/contract-draft-builder'
import { formatMoney } from './contract-editor-constants'

type Props = {
  projectName: string
  values: ProjectContractDraftInput
  hasContract: boolean
  busy: boolean
  isSaving: boolean
  isSending: boolean
  onSave: () => void
  onSend: () => void
}

export function ContractEditorSummary({
  projectName,
  values,
  hasContract,
  busy,
  isSaving,
  isSending,
  onSave,
  onSend,
}: Props) {
  const clientDisplayName =
    values.client_kind === 'juridical'
      ? values.client_company_name || values.client_representative || 'Pendiente'
      : values.client_name || 'Pendiente'

  const totalContract = values.monthly_fee * values.term_months
  const checklist = getContractDraftChecklist(values)
  const completedCount = checklist.filter((item) => item.done).length

  return (
    <aside className="rounded-xl border border-border/80 bg-card shadow-xs">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Resumen Comercial y Firma</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{projectName}</p>
        </div>
        <Badge variant={hasContract ? 'default' : 'secondary'} className="text-[10px]">
          {hasContract ? 'Borrador guardado' : 'Borrador local'}
        </Badge>
      </div>

      <div className="space-y-4 p-4 text-xs">
        {/* Métricas clave financieras */}
        <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
          <div>
            <p className="text-[11px] text-muted-foreground">Plan seleccionado</p>
            <p className="font-bold text-foreground text-sm">{values.plan_name}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatMoney(values.monthly_fee)}/mes
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Total estimado</p>
            <p className="font-bold text-primary text-sm tabular-nums">
              {formatMoney(totalContract)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {values.term_months} meses · {values.tax_included ? 'Con IVA' : 'Sin IVA'}
            </p>
          </div>
        </div>

        {/* Firmante */}
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">Firmante acreditado</p>
          <p className="font-semibold text-foreground">{clientDisplayName}</p>
          <p className="truncate text-muted-foreground">
            {values.client_email || 'Correo pendiente de asignación'}
          </p>
        </div>

        {/* Checklist interactivo de requisitos de firma */}
        <div className="space-y-1.5 pt-1 border-t border-border/40">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Requisitos de firma</span>
            <span className="tabular-nums font-medium">
              {completedCount} de {checklist.length} listos
            </span>
          </div>

          <div className="space-y-1 pt-0.5">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-[11px]">
                {item.done ? (
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <span className="size-3 rounded-full border border-muted-foreground/50 shrink-0 inline-block m-px" />
                )}
                <span className={item.done ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inmutabilidad advertencia */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 p-2.5 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2">
          <ShieldCheck className="size-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            Al habilitar la firma, el documento y sus cláusulas quedan congelados con validación SHA-256.
          </span>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2 pt-1">
          <Button
            className="w-full h-8 text-xs font-semibold"
            variant="outline"
            onClick={onSave}
            disabled={busy}
          >
            {isSaving ? 'Guardando borrador…' : 'Guardar borrador'}
          </Button>

          <Button
            className="w-full h-8 text-xs font-semibold gap-1.5"
            onClick={onSend}
            disabled={busy || !hasContract}
          >
            <Send className="size-3.5" />
            {isSending ? 'Habilitando firma…' : 'Habilitar firma del cliente'}
          </Button>

          {!hasContract && (
            <p className="text-center text-[11px] text-muted-foreground">
              Guarda el borrador antes de habilitar la firma.
            </p>
          )}
        </div>
      </div>
    </aside>
  )
}
