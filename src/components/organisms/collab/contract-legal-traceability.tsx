import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectContract } from '@/features/collab/model'
import { downloadSignedContractPdf } from '@/features/collab/lib/contract-pdf-downloader'

type Props = {
  contract: ProjectContract
  projectName: string
  onError: (message: string) => void
}

export function ContractLegalTraceability({ contract, projectName, onError }: Props) {
  const handleDownload = () => {
    void downloadSignedContractPdf(contract, projectName).catch((error) =>
      onError(error instanceof Error ? error.message : 'No se pudo generar el PDF'),
    )
  }

  return (
    <aside
      className={[
        'flex flex-col rounded-xl border border-border/70 bg-card p-4.5 text-xs',
        'shadow-2xs overflow-y-auto space-y-3',
      ].join(' ')}
    >
      <p className="font-bold text-foreground text-sm tracking-tight">Trazabilidad legal</p>
      <div className="space-y-1.5 text-muted-foreground">
        <p>
          Preparado:{' '}
          <span className="text-foreground font-medium">
            {new Date(contract.createdAt).toLocaleString('es-CO')}
          </span>
        </p>
        {contract.requestedSignatureAt && (
          <p>
            Habilitado para firma:{' '}
            <span className="text-foreground font-medium">
              {new Date(contract.requestedSignatureAt).toLocaleString('es-CO')}
            </span>
          </p>
        )}
        {contract.signedAt && (
          <p>
            Firmado:{' '}
            <span className="text-foreground font-medium">
              {new Date(contract.signedAt).toLocaleString('es-CO')}
            </span>
          </p>
        )}
        {contract.signerName && (
          <p className="font-semibold text-foreground">Firmante: {contract.signerName}</p>
        )}
      </div>

      {contract.signedAt && (
        <>
          {contract.signatureDataUrl && (
            <div className="rounded-lg border border-border/70 bg-white dark:bg-zinc-900 p-2 shadow-2xs">
              <img
                src={contract.signatureDataUrl}
                alt="Firma registrada"
                className="h-16 w-full object-contain"
              />
            </div>
          )}
          {contract.contentHash && (
            <p
              className={[
                'break-all text-[10px] text-muted-foreground font-mono bg-muted/40 p-2',
                'rounded-lg border border-border/60',
              ].join(' ')}
            >
              SHA-256: {contract.contentHash}
            </p>
          )}
        </>
      )}

      {contract.status === 'signed' && (
        <Button
          className={[
            'w-full gap-2 text-xs font-semibold mt-auto rounded-lg border-emerald-300',
            'text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300',
            'dark:hover:bg-emerald-950/40 shadow-2xs transition-colors',
          ].join(' ')}
          variant="outline"
          onClick={handleDownload}
        >
          <CheckCircle2 className="size-4 text-emerald-600" />
          Descargar PDF firmado
        </Button>
      )}
    </aside>
  )
}
