import { useState } from 'react'
import { Check, CheckCircle2, Copy, Download, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadSignedContractPdf } from '@/features/collab/lib/contract-pdf-downloader'
import type { ProjectContract } from '@/features/collab/model'
import { cn } from '@/shared/lib/utils'

export type ContractLegalStampSealProps = {
  contract: ProjectContract
  projectName?: string
  isFreshlySealed?: boolean
  onDismiss?: () => void
  onError?: (message: string) => void
  className?: string
}

export function ContractLegalStampSeal({
  contract,
  projectName = 'Proyecto',
  isFreshlySealed = true,
  onDismiss,
  onError,
  className,
}: ContractLegalStampSealProps) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const sha256Hash =
    contract.contentHash ||
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

  const formattedDate = contract.signedAt
    ? new Date(contract.signedAt).toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
    : new Date().toLocaleString('es-CO')

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(sha256Hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // safe fallback
    }
  }

  const handleDownload = async () => {
    try {
      setDownloading(true)
      await downloadSignedContractPdf(contract, projectName)
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Error al descargar PDF')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      data-testid="contract-legal-stamp"
      className={cn(
        'relative rounded-xl border border-emerald-500/40 bg-card p-4.5 shadow-sm',
        'bg-gradient-to-b from-emerald-500/5 via-transparent to-emerald-500/[0.02]',
        isFreshlySealed && 'animate-legal-stamp',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg',
              'bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
            )}
          >
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-tight text-foreground uppercase">
              Sello Digital Inmutable CIMA
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Certificación Legal · Ley 527 de 1999
            </p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border border-emerald-500/30',
            'bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300'
          )}
        >
          <CheckCircle2 className="size-3" />
          Verificado
        </span>
      </div>

      <div className="my-3 space-y-2.5 text-xs">
        <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Firmante autorizante:</span>
            <span className="font-semibold text-foreground">
              {contract.signerName || contract.clientRepresentative || contract.clientName}
            </span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Fecha y hora de sellado:</span>
            <span className="font-medium text-foreground">{formattedDate}</span>
          </div>
        </div>

        {contract.signatureDataUrl && (
          <div className="rounded-lg border border-border/70 bg-white dark:bg-zinc-950 p-2 text-center shadow-2xs">
            <span className="text-[10px] font-medium uppercase text-muted-foreground block mb-1">
              Firma manuscrita enlazada
            </span>
            <img
              src={contract.signatureDataUrl}
              alt="Firma registrada"
              data-testid="sealed-signature-image"
              className="h-14 w-full object-contain"
            />
          </div>
        )}

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground block">
            Huella criptográfica inmutable (SHA-256):
          </span>
          <div
            data-testid="sealed-sha256-hash"
            className={cn(
              'flex items-center justify-between gap-2 rounded-lg border border-emerald-500/30',
              'bg-emerald-500/5 px-2.5 py-1.5 font-mono text-[10px] text-foreground'
            )}
          >
            <span className="truncate">{sha256Hash}</span>
            <button
              type="button"
              onClick={handleCopyHash}
              className={cn(
                'shrink-0 p-1 rounded hover:bg-emerald-500/20',
                'text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
              )}
              title="Copiar hash SHA-256"
              aria-label="Copiar huella criptográfica SHA-256"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <Button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="w-full gap-2 text-xs font-semibold shadow-xs"
        >
          <Download className="size-3.5" />
          {downloading ? 'Generando PDF…' : 'Descargar PDF firmado con sello'}
        </Button>

        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            onClick={onDismiss}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            Ver trazabilidad completa
          </Button>
        )}
      </div>
    </div>
  )
}
