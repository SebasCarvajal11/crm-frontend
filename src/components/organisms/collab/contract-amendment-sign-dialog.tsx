import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SignaturePad } from '@/components/molecules/signature-pad'
import { ContractDocumentReader } from './contract-document-reader'
import {
  collabKeys,
  type ProjectContract,
  type ProjectContractAmendment,
} from '@/features/collab/model'
import { signProjectContractAmendmentRequest } from '@/features/collab/api'
import { parseApiError } from '@/shared/lib'

type Props = {
  open: boolean
  onClose: () => void
  accessToken: string
  projectId: string
  amendment: ProjectContractAmendment
  contract: ProjectContract
  onError: (msg: string) => void
}

export function ContractAmendmentSignDialog({
  open,
  onClose,
  accessToken,
  projectId,
  amendment,
  contract,
  onError,
}: Props) {
  const queryClient = useQueryClient()
  const [signature, setSignature] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [name, setName] = useState(contract.clientRepresentative || contract.clientName)

  const sign = useMutation({
    mutationFn: () =>
      signProjectContractAmendmentRequest(accessToken, projectId, amendment.id, {
        signer_name: name,
        signature_data_url: signature!,
        accept_terms: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collabKeys.contractAmendments(projectId) })
      onClose()
    },
    onError: (error) => {
      void parseApiError(error).then((msg) => onError(msg || 'No se pudo registrar la firma del Otrosí'))
    },
  })

  const isReady = Boolean(signature) && accepted && name.trim().length >= 2 && !sign.isPending
  const numStr = amendment.amendmentNumber.toString().padStart(2, '0')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="border-b px-5 py-3.5 bg-muted/20">
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <PenLine className="size-4 text-primary" />
            Revisar y Firmar Otrosí N° {numStr}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid gap-4 p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,22rem)] overflow-hidden">
          <div className="h-[20rem] lg:h-[28rem] overflow-y-auto pr-1">
            <ContractDocumentReader
              content={amendment.contentSnapshot || amendment.serviceScope}
            />
          </div>

          <div className="flex flex-col space-y-3 overflow-y-auto rounded-xl border bg-card p-3 text-xs">
            <div>
              <Label className="mb-1 block font-medium">Nombre de quien firma</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre completo"
                data-testid="amendment-signer-name-input"
              />
            </div>

            <div>
              <Label className="mb-1 block font-medium">Firma manuscrita digital</Label>
              <SignaturePad onChange={setSignature} />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="accept-amendment-terms"
                checked={accepted}
                onCheckedChange={(val) => setAccepted(Boolean(val))}
                data-testid="amendment-accept-checkbox"
              />
              <label
                htmlFor="accept-amendment-terms"
                className="text-[11px] leading-tight text-muted-foreground cursor-pointer"
              >
                Acepto los términos y modificaciones estipulados en este Otrosí bajo la Ley 527 de 1999 de Colombia.
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 mt-auto">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!isReady}
                onClick={() => sign.mutate()}
                data-testid="submit-amendment-sign-btn"
              >
                {sign.isPending ? 'Firmando...' : 'Firmar Otrosí'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
