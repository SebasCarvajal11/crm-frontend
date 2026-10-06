import { UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogTitle,
} from '@/components/ui/dialog'

interface ProfilePhotoViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  avatarUrl?: string | null
}

export function ProfilePhotoViewerDialog({
  open,
  onOpenChange,
  avatarUrl,
}: ProfilePhotoViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogMedia variant="default">
            <UserCircle2 className="size-5" />
          </DialogMedia>
          <div className="flex flex-col gap-1 text-left min-w-0">
            <DialogTitle>Foto de perfil</DialogTitle>
            <DialogDescription>Vista previa de tu avatar actual.</DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="flex items-center justify-center py-6">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Foto de perfil actual"
              className="size-60 rounded-full border-4 border-card object-cover shadow-xl ring-2 ring-primary/20"
            />
          ) : (
            <div
              className={[
                'flex size-60 items-center justify-center rounded-full',
                'border-4 border-card bg-muted shadow-xl ring-2 ring-border',
              ].join(' ')}
            >
              <UserCircle2 className="size-24 text-muted-foreground" />
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
