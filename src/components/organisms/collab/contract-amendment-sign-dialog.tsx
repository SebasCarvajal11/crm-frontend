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
  DialogDescription,
  DialogHeader,
  DialogMedia,
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
      <DialogContent size="4xl" className="max-h-[92vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogMedia variant="default">
              <PenLine className="size-5" />
            </DialogMedia>
            <div className="space-y-0.5">
              <DialogTitle>Revisar y Firmar Otrosí N° {numStr}</DialogTitle>
              <DialogDescription>
                Valida las estipulaciones contractuales y estampa tu firma manuscrita digital bajo la Ley 527/1999.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,22rem)] overflow-hidden">
          <div className="h-[20rem] lg:h-[28rem] overflow-y-auto pr-1 rounded-xl border border-border/70 bg-card p-3 shadow-inner scrollbar-thin">
            <ContractDocumentReader
              content={amendment.contentSnapshot || amendment.serviceScope}
            />
          </div>

          <div className="flex flex-col space-y-3.5 overflow-y-auto rounded-xl border border-border/70 bg-muted/20 p-4 text-xs shadow-2xs">
            <div>
              <Label className="mb-1 block text-xs font-semibold text-foreground/90">Nombre de quien firma</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre completo"
                data-testid="amendment-signer-name-input"
                className="text-xs h-9 bg-card"
              />
            </div>

            <div>
              <Label className="mb-1 block text-xs font-semibold text-foreground/90">Firma manuscrita digital</Label>
              <SignaturePad onChange={setSignature} />
            </div>

            <div className="flex items-start gap-2.5 pt-1 rounded-lg border border-border/60 bg-card/60 p-2.5">
              <Checkbox
                id="accept-amendment-terms"
                checked={accepted}
                onCheckedChange={(val) => setAccepted(Boolean(val))}
                data-testid="amendment-accept-checkbox"
                className="mt-0.5"
              />
              <label
                htmlFor="accept-amendment-terms"
                className="text-[11px] leading-relaxed text-muted-foreground cursor-pointer"
              >
                Acepto los términos y modificaciones estipulados en este Otrosí bajo la Ley 527 de 1999 de Colombia.
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 mt-auto border-t border-border/50">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!isReady}
                onClick={() => sign.mutate()}
                data-testid="submit-amendment-sign-btn"
                className="text-xs font-semibold shadow-2xs"
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
