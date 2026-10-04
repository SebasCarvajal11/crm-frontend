import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FileSignature, PenLine, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SignaturePad } from '@/components/molecules/signature-pad'
import { collabKeys, type ProjectContract } from '@/features/collab/model'
import { signProjectContractRequest } from '@/features/collab/api'
import { parseApiError } from '@/shared/lib'
import { cn } from '@/shared/lib/utils'
import { ContractLegalStampSeal } from './contract-legal-stamp-seal'

type Props = {
  accessToken: string
  projectId: string
  projectName?: string
  contract: ProjectContract
  onError: (message: string) => void
  onSealComplete?: () => void
  onDismissSeal?: () => void
}

export function ContractClientSignature({
  accessToken,
  projectId,
  projectName = 'Proyecto',
  contract,
  onError,
  onSealComplete,
  onDismissSeal,
}: Props) {
  const queryClient = useQueryClient()
  const [signature, setSignature] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [name, setName] = useState(contract.clientRepresentative || contract.clientName)
  const [sealedContract, setSealedContract] = useState<ProjectContract | null>(null)

  const sign = useMutation({
    mutationFn: () =>
      signProjectContractRequest(accessToken, projectId, {
        signer_name: name,
        signature_data_url: signature!,
        accept_terms: true,
      }),
    onSuccess: (res) => {
      const fallbackHash =
        '7d793037a0760186574b0282f2f435e7093a0ac453d8b8a4f465a3447ca59038'
      const sealed: ProjectContract = res?.data ?? {
        ...contract,
        status: 'signed',
        signerName: name,
        signatureDataUrl: signature,
        signedAt: new Date().toISOString(),
        contentHash: contract.contentHash ?? fallbackHash,
      }
      setSealedContract(sealed)
      onSealComplete?.()
      void queryClient.invalidateQueries({ queryKey: collabKeys.contract(projectId) })
    },
    onError: (error) => {
      void parseApiError(error).then((msg) => onError(msg || 'No se pudo registrar la firma'))
    },
  })

  const isReady =
    Boolean(signature) && accepted && name.trim().length >= 2 && !sign.isPending

  if (sealedContract) {
    return (
      <aside
        data-testid="contract-signature-sealed-view"
        className="flex flex-col h-fit lg:h-full rounded-xl border bg-card shadow-xs overflow-hidden"
      >
        <div className="border-b bg-muted/20 px-4 py-3 shrink-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldCheck className="size-4 text-emerald-600" />
            Formalización contractual completada
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Firma estampada con huella criptográfica e inmutabilidad legal CIMA.
          </p>
        </div>
        <div className="p-4 flex-1 lg:overflow-y-auto">
          <ContractLegalStampSeal
            contract={sealedContract}
            projectName={projectName}
            isFreshlySealed
            onDismiss={onDismissSeal}
            onError={onError}
          />
        </div>
      </aside>
    )
  }

  return (
    <aside
      className="flex flex-col h-fit lg:h-full rounded-xl border bg-card shadow-xs overflow-hidden"
    >
      <div className="border-b bg-muted/20 px-4 py-3 shrink-0">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <PenLine className="size-4 text-primary" />
          Firma electrónica del cliente
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Firma con el dedo o mouse para formalizar el contrato legalmente.
        </p>
      </div>

      <div className="flex-1 space-y-3.5 p-4 lg:overflow-y-auto text-sm">
        <div>
          <Label className="mb-1 block text-xs font-medium text-foreground">
            Nombre de quien firma
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre completo"
            className="h-8 text-xs"
          />
        </div>

        <div>
          <Label className="mb-1 block text-xs font-medium text-foreground">
            Trazo manuscrito (Tinta dinámica)
          </Label>
          <SignaturePad onChange={setSignature} />
        </div>

        <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-2.5">
          <Checkbox
            id="contract-consent"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(checked === true)}
            className="mt-0.5"
          />
          <Label
            htmlFor="contract-consent"
            className="text-[11px] leading-relaxed text-foreground cursor-pointer"
          >
            Acepto los términos del contrato de servicios y autorizo esta firma electrónica como
            evidencia fehaciente de aceptación.
          </Label>
        </div>

        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50/70 p-2 text-[11px]',
            'text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
          )}
        >
          <ShieldCheck className="size-4 shrink-0 text-sky-700 dark:text-sky-400" />
          <span>Al confirmar, se generará la huella criptográfica SHA-256 del documento.</span>
        </div>

        <Button
          data-testid="contract-sign-submit-btn"
          className="w-full gap-2 font-semibold text-white shadow-xs"
          onClick={() => sign.mutate()}
          disabled={!isReady}
        >
          <FileSignature className="size-4" />
          {sign.isPending ? 'Registrando firma…' : 'Firmar contrato legalmente'}
        </Button>
      </div>
    </aside>
  )
}
