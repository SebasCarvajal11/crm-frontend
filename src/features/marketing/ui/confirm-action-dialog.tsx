import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmActionDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  /** warning para desactivar, default para reactivar. */
  tone?: 'warning' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

/** Confirmación breve antes de desactivar o reactivar un plan o una plantilla. */
export function ConfirmActionDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = 'warning',
  onConfirm,
  onCancel,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia variant={tone}>
            <AlertTriangle className="size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl text-xs">Cancelar</AlertDialogCancel>
          <AlertDialogAction className="rounded-xl text-xs font-medium" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
