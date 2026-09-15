import { Download, FileSignature, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectContract } from '@/features/collab/model'
import { downloadSignedContractPdf } from '@/features/collab/lib/contract-pdf'

type Props = {
  contract: ProjectContract
  projectName: string
  onError: (msg: string) => void
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)

const formatBogotaDate = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return '—'
  try {
    return new Date(ts).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12: false,
    })
  } catch {
    return '—'
  }
}

export function ContractTimelineCard({ contract, projectName, onError }: Props) {
  const isSigned = contract.status === 'signed'
  const isPending = contract.status === 'pending_signature'

  if (!isSigned && !isPending) return null

  return (
    <div
      className={`rounded-xl border p-3.5 shadow-xs transition-all ${
        isSigned
          ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20'
          : 'border-sky-200 bg-sky-50/40 dark:border-sky-900/60 dark:bg-sky-950/20'
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <FileSignature className={`size-4 ${isSigned ? 'text-emerald-700' : 'text-sky-700'}`} />
          <span className="text-xs font-bold text-foreground">
            {isSigned ? 'Contrato digital firmado' : 'Contrato en proceso de firma'}
          </span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
            isSigned
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-sky-100 text-sky-800 border-sky-300'
          }`}
        >
          {isSigned ? 'Firmado' : 'Pendiente de firma'}
        </span>
      </div>

      <div className="space-y-2 pt-2.5 text-xs">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-foreground">{contract.planName}</span>
          <span className="text-muted-foreground">
            {formatMoney(contract.monthlyFee)} / mes · {contract.termMonths} meses
          </span>
        </div>

        {isSigned && (
          <>
            <div className="space-y-1 text-muted-foreground">
              <p>
                <strong className="text-foreground">Firmante:</strong> {contract.signerName}
              </p>
              <p className="truncate">
                <strong className="text-foreground">Email:</strong> {contract.clientEmail}
              </p>
              <p>
                <strong className="text-foreground">Fecha:</strong> {formatBogotaDate(contract.signedAt)}
              </p>
            </div>

            {contract.signatureDataUrl && (
              <div className="rounded-lg border bg-white p-1.5 dark:bg-zinc-900">
                <img
                  src={contract.signatureDataUrl}
                  alt="Firma electrónica registrada"
                  className="h-10 w-full object-contain"
                />
              </div>
            )}

            {contract.contentHash && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono truncate">
                <ShieldCheck className="size-3 shrink-0 text-emerald-700" />
                <span className="truncate">SHA: {contract.contentHash}</span>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              className="mt-1 w-full gap-1.5 text-xs border-emerald-300 hover:bg-emerald-100/50"
              onClick={() =>
                void downloadSignedContractPdf(contract, projectName).catch((err) =>
                  onError(err instanceof Error ? err.message : 'Error al descargar PDF'),
                )
              }
            >
              <Download className="size-3.5 text-emerald-700" />
              Descargar PDF firmado
            </Button>
          </>
        )}

        {isPending && (
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Habilitado para firma el {formatBogotaDate(contract.requestedSignatureAt)}. Esperando firma
            manuscrita del cliente.
          </p>
        )}
      </div>
    </div>
  )
}
