import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileSignature, Send, Download, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  collabKeys,
  type ProjectContract,
  type ProjectContractAmendment,
} from '@/features/collab/model'
import {
  listProjectContractAmendmentsRequest,
  requestProjectContractAmendmentSignatureRequest,
} from '@/features/collab/api'
import { downloadSignedAmendmentPdf } from '@/features/collab/lib/contract-pdf'
import { parseApiError } from '@/shared/lib'
import { ContractAmendmentModal } from './contract-amendment-modal'
import { ContractAmendmentSignDialog } from './contract-amendment-sign-dialog'

type Props = {
  accessToken: string
  projectId: string
  projectName: string
  contract: ProjectContract
  role: 'admin' | 'worker' | 'client'
  onError: (msg: string) => void
}

const statusBadgeCopy: Record<ProjectContractAmendment['status'], { label: string; className: string }> = {
  draft: { label: 'Borrador', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  pending_signature: { label: 'Pendiente de firma', className: 'bg-sky-100 text-sky-800 border-sky-200' },
  signed: { label: 'Firmado', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
}

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)

export function ContractAmendmentsList({
  accessToken,
  projectId,
  projectName,
  contract,
  role,
  onError,
}: Props) {
  const queryClient = useQueryClient()
  const [signingAmendment, setSigningAmendment] = useState<ProjectContractAmendment | null>(null)

  const { data: amendments = [], isLoading } = useQuery({
    queryKey: collabKeys.contractAmendments(projectId),
    queryFn: async () => {
      const res = await listProjectContractAmendmentsRequest(accessToken, projectId)
      return res.data ?? []
    },
  })

  const requestSign = useMutation({
    mutationFn: (amendmentId: string) =>
      requestProjectContractAmendmentSignatureRequest(accessToken, projectId, amendmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: collabKeys.contractAmendments(projectId) })
    },
    onError: (err) =>
      void parseApiError(err).then((msg) => onError(msg || 'No se pudo enviar a firma')),
  })

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileSignature className="size-4 text-primary" />
            Otrosíes y Adiciones al Contrato Principal
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Modificaciones formales y nuevos servicios agregados a la campaña sin romper el contrato base.
          </p>
        </div>
        <ContractAmendmentModal
          accessToken={accessToken}
          projectId={projectId}
          role={role}
          onError={onError}
        />
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-muted-foreground">Cargando Otrosíes...</div>
      ) : amendments.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <FileSignature className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-2 text-xs font-semibold text-foreground">No hay Otrosíes ni adiciones formalizadas</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {role === 'admin'
              ? 'Si el cliente solicita piezas o servicios adicionales, crea un Otrosí para formalizarlo legalmente.'
              : 'Puedes solicitar nuevos entregables o servicios haciendo clic en "Solicitar Adición de Servicio".'}
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="amendments-list">
          {amendments.map((item) => {
            const badge = statusBadgeCopy[item.status]
            const numStr = item.amendmentNumber.toString().padStart(2, '0')

            return (
              <div
                key={item.id}
                data-testid={`amendment-card-${item.id}`}
                className="rounded-xl border bg-card p-4 text-xs shadow-xs transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">Otrosí N° {numStr}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <h5 className="mt-1 text-sm font-semibold text-foreground">{item.title}</h5>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'draft' && role === 'admin' && (
                      <Button
                        size="xs"
                        variant="default"
                        className="gap-1.5"
                        disabled={requestSign.isPending}
                        onClick={() => requestSign.mutate(item.id)}
                        data-testid={`request-amendment-sign-btn-${item.id}`}
                      >
                        <Send className="size-3" />
                        Habilitar para firma
                      </Button>
                    )}

                    {item.status === 'pending_signature' && role === 'client' && (
                      <Button
                        size="xs"
                        variant="default"
                        className="gap-1.5"
                        onClick={() => setSigningAmendment(item)}
                        data-testid={`open-sign-amendment-btn-${item.id}`}
                      >
                        <FileSignature className="size-3" />
                        Revisar y firmar
                      </Button>
                    )}

                    {item.status === 'signed' && (
                      <Button
                        size="xs"
                        variant="outline"
                        className="gap-1.5 font-medium"
                        onClick={() =>
                          void downloadSignedAmendmentPdf(item, contract, projectName).catch((err) =>
                            onError(err instanceof Error ? err.message : 'Error al descargar PDF'),
                          )
                        }
                        data-testid={`download-amendment-pdf-btn-${item.id}`}
                      >
                        <Download className="size-3 text-emerald-600" />
                        Descargar PDF
                      </Button>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-muted-foreground whitespace-pre-line leading-relaxed">
                  {item.serviceScope}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4 border-t pt-2.5 text-[11px] text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Valor adicional: </span>
                    {item.additionalFee > 0
                      ? `${formatMoney(item.additionalFee)} (${item.feePaymentType === 'monthly_recurring' ? 'Mensual' : 'Pago único'})`
                      : 'Sin costo adicional'}
                  </div>

                  {item.termMonthsExtension > 0 && (
                    <div>
                      <span className="font-medium text-foreground">Prórroga: </span>
                      +{item.termMonthsExtension} mes(es)
                    </div>
                  )}

                  {item.signedAt && (
                    <div className="flex items-center gap-1 text-emerald-700">
                      <ShieldCheck className="size-3.5" />
                      Firmado: {new Date(item.signedAt).toLocaleDateString('es-CO')}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {signingAmendment && (
        <ContractAmendmentSignDialog
          open={Boolean(signingAmendment)}
          onClose={() => setSigningAmendment(null)}
          accessToken={accessToken}
          projectId={projectId}
          amendment={signingAmendment}
          contract={contract}
          onError={onError}
        />
      )}
    </div>
  )
}
