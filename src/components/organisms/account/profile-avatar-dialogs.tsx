import Cropper, { type Area, type Point } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { Camera, Loader2, UserCircle2 } from 'lucide-react'
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
              onClick={() => setPhotoViewerOpen(false)}
              className="rounded-xl text-xs"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedImageSrc)}
        onOpenChange={(open) => !open && clearSelectedImage()}
      >
        <DialogContent size="xl">
          <DialogHeader>
            <DialogMedia variant="default">
              <Camera className="size-5" />
            </DialogMedia>
            <div className="flex flex-col gap-1 text-left min-w-0">
              <DialogTitle>Editar foto de perfil</DialogTitle>
              <DialogDescription>
                Ajusta la posición y el zoom para encuadrar tu avatar. Luego presiona Guardar.
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div
              className={[
                'relative mx-auto aspect-square w-full max-h-[min(50dvh,18rem)]',
                'overflow-hidden rounded-2xl border border-border/80 bg-black/90 shadow-inner',
              ].join(' ')}
            >
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

            <div className="space-y-1.5 px-1">
              <label htmlFor="avatar-zoom" className="text-xs font-medium text-foreground/90">
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
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelectedImage}
              disabled={isUploading}
              className="rounded-xl text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => void onSaveCroppedAvatar()}
              disabled={isUploading}
              className="rounded-xl text-xs font-medium shadow-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar foto'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
