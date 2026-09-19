import { Send, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectContractDraftInput } from '@/features/collab/api'
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
      ? values.client_representative || 'Pendiente'
      : values.client_name

  return (
    <aside className="rounded-xl border bg-card shadow-xs h-fit">
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Resumen</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Revisa antes de habilitar la firma.</p>
      </div>

      <div className="space-y-4 p-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Proyecto</p>
          <p className="font-semibold text-foreground">{projectName}</p>
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
          <p className="font-semibold text-foreground">{clientDisplayName}</p>
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
          onClick={onSave}
          disabled={busy}
        >
          {isSaving ? 'Guardando…' : 'Guardar borrador'}
        </Button>

        <Button
          className="w-full gap-1.5"
          onClick={onSend}
          disabled={busy || !hasContract}
        >
          <Send className="size-4" />
          {isSending ? 'Habilitando…' : 'Habilitar firma del cliente'}
        </Button>

        {!hasContract && (
          <p className="text-center text-xs text-muted-foreground">
            Guarda el borrador antes de habilitar la firma.
          </p>
        )}
      </div>
    </aside>
  )
}
