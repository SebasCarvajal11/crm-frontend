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
  color?: string | null
}

export function ProfilePhotoViewerDialog({
  open,
  onOpenChange,
  avatarUrl,
  color,
}: ProfilePhotoViewerDialogProps) {
  const urlColorMatch = avatarUrl?.match(/[?&]c=([0-9a-fA-F]{3,8})/)?.[1]
  const effectiveBg = color ?? (urlColorMatch ? `#${urlColorMatch}` : undefined)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogMedia variant="default">
            <UserCircle2 className="size-5" />
          </DialogMedia>
          <div className="flex flex-col gap-1 text-left min-w-0">
            <DialogTitle>Avatar oficial</DialogTitle>
            <DialogDescription>Vista previa de tu avatar oficial CIMA.</DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="flex items-center justify-center py-6">
          {avatarUrl ? (
            <div
              className="size-60 rounded-full border-4 border-card overflow-hidden shadow-xl ring-2 ring-primary/20 flex items-center justify-center transition-colors"
              style={{ backgroundColor: effectiveBg }}
            >
              <img
                src={avatarUrl}
                alt="Avatar actual"
                className="size-full object-cover rounded-full"
              />
            </div>
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
