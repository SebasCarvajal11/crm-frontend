import { ShieldCheck } from 'lucide-react'
import type { ProjectContract } from '@/features/collab/model'
import { ContractLegalStampSeal } from './contract-legal-stamp-seal'

type Props = {
  contract: ProjectContract
  projectName: string
  onError: (message: string) => void
}

export function ContractLegalTraceability({ contract, projectName, onError }: Props) {
  if (contract.status === 'signed') {
    return (
      <aside className="flex flex-col rounded-xl border border-border/70 bg-card p-4.5 text-xs shadow-2xs overflow-y-auto space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-border/60">
          <p className="font-bold text-foreground text-sm tracking-tight flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-600" />
            Trazabilidad y Sello Legal
          </p>
        </div>
        <div className="space-y-1 text-muted-foreground text-[11px]">
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
        </div>
        <ContractLegalStampSeal
          contract={contract}
          projectName={projectName}
          isFreshlySealed={false}
          onError={onError}
        />
      </aside>
    )
  }

  return (
    <aside className="flex flex-col rounded-xl border border-border/70 bg-card p-4.5 text-xs shadow-2xs overflow-y-auto space-y-3">
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
      </div>
    </aside>
  )
}
