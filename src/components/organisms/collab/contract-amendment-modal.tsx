import { useState } from 'react'
import { PlusCircle, Send, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogMedia,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ContractAmendmentAdminForm } from './contract-amendment-admin-form'
import { ContractAmendmentClientForm } from './contract-amendment-client-form'

type Props = {
  accessToken: string
  projectId: string
  role: 'admin' | 'worker' | 'client'
  onError: (msg: string) => void
}

export function ContractAmendmentModal({ accessToken, projectId, role, onError }: Props) {
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 text-xs font-semibold"
          data-testid="open-amendment-modal-btn"
        >
          {role === 'admin' ? (
            <>
              <PlusCircle className="size-3.5" />
              Crear Otrosí / Adición
            </>
          ) : (
            <>
              <Send className="size-3.5" />
              Solicitar Adición de Servicio
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent size="xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogMedia variant="default">
              <FileText className="size-5" />
            </DialogMedia>
            <div className="space-y-0.5">
              <DialogTitle>
                {role === 'admin'
                  ? 'Formalizar Otrosí al Contrato Principal'
                  : 'Solicitud de Adición de Servicio'}
              </DialogTitle>
              <DialogDescription>
                {role === 'admin'
                  ? 'Define los términos contractuales, adiciones de alcance y valor pactado.'
                  : 'Describe los servicios adicionales o requerimientos requeridos para su evaluación.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {role === 'admin' ? (
          <ContractAmendmentAdminForm
            accessToken={accessToken}
            projectId={projectId}
            onSuccess={handleClose}
            onCancel={handleClose}
            onError={onError}
          />
        ) : (
          <ContractAmendmentClientForm
            accessToken={accessToken}
            projectId={projectId}
            onSuccess={handleClose}
            onCancel={handleClose}
            onError={onError}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
