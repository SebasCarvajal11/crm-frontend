import Cropper, { type Area, type Point } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { Loader2, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/shared/lib/utils'

interface ProfileAvatarDialogsProps {
  avatarUrl?: string | null
  photoViewerOpen: boolean
  setPhotoViewerOpen: (open: boolean) => void
  selectedImageSrc: string | null
  clearSelectedImage: () => void
  crop: Point
  setCrop: (crop: Point) => void
  zoom: number
  setZoom: (zoom: number) => void
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void
  onSaveCroppedAvatar: () => Promise<void>
  isUploading: boolean
}

export function ProfileAvatarDialogs({
  avatarUrl,
  photoViewerOpen,
  setPhotoViewerOpen,
  selectedImageSrc,
  clearSelectedImage,
  crop,
  setCrop,
  zoom,
  setZoom,
  onCropComplete,
  onSaveCroppedAvatar,
  isUploading,
}: ProfileAvatarDialogsProps) {
  return (
    <>
      <Dialog open={photoViewerOpen} onOpenChange={setPhotoViewerOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-md sm:w-full">
          <DialogHeader>
            <DialogTitle>Foto de perfil</DialogTitle>
            <DialogDescription>Vista previa de tu avatar actual.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil actual"
                className="size-64 rounded-full border-4 border-card object-cover shadow-lg"
              />
            ) : (
              <div className="flex size-64 items-center justify-center rounded-full border-4 border-card bg-muted shadow-lg">
                <UserCircle2 className="size-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedImageSrc)}
        onOpenChange={(open) => !open && clearSelectedImage()}
      >
        <DialogContent
          className={cn(
            'flex w-[calc(100vw-1rem)] max-w-xl flex-col gap-0 overflow-hidden p-0 sm:w-full',
            'top-[max(0.75rem,env(safe-area-inset-top))] max-h-[calc(100dvh-1.5rem)] translate-y-0',
            'sm:top-1/2 sm:max-h-[min(90dvh,100%)] sm:-translate-y-1/2',
          )}
        >
          <DialogHeader className="shrink-0 border-b p-4 sm:p-6">
            <DialogTitle>Editar foto de perfil</DialogTitle>
            <DialogDescription>
              Ajusta la posición y el zoom para encuadrar tu avatar. Luego presiona Guardar.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            <div className="relative mx-auto aspect-square w-full max-h-[min(50dvh,18rem)] overflow-hidden rounded-xl border bg-black/90">
              {selectedImageSrc && (
                <Cropper
                  image={selectedImageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="avatar-zoom" className="text-xs font-semibold uppercase text-muted-foreground">
                Zoom
              </label>
              <input
                id="avatar-zoom"
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t bg-muted/20 p-4 sm:px-6">
            <Button
              variant="outline"
              onClick={clearSelectedImage}
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => void onSaveCroppedAvatar()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
