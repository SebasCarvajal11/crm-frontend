import { Link } from '@tanstack/react-router'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import { CheckCircle2, Loader2, MailWarning, UserCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { SectionIntro } from '@/components/molecules/section-intro'
import { useAccountProfileSection } from '@/features/auth/hooks'
import { cn } from '@/shared/lib/utils'
import type { MeResponse } from '@/features/auth/model'

type Props = {
  accessToken: string
  identity: MeResponse['data']
}

const displayOrFallback = (value: string | null | undefined, fallback = 'No registrado') =>
  value?.trim() ? value : fallback

const roleLabel: Record<MeResponse['data']['role'], string> = {
  admin: 'Admin',
  worker: 'Trabajador',
  client: 'Cliente',
}

export function ProfileSection({ accessToken, identity }: Props) {
  const isVerified = Boolean(identity.emailVerifiedAt)
  const {
    avatarInputRef,
    avatarUrl,
    crop,
    croppedAreaPixels,
    onAvatarFileSelect,
    onCropComplete,
    onSaveCroppedAvatar,
    photoViewerOpen,
    selectedImageSrc,
    setCrop,
    setPhotoViewerOpen,
    setSelectedImageSrc,
    setZoom,
    uploadAvatarMutation,
    verifyMutation,
    zoom,
  } = useAccountProfileSection(accessToken)

  return (
    <section className="w-full min-w-0 space-y-4">
      <SectionIntro title="Mi Cuenta" description="Gestiona tu perfil, foto y estado de verificacion." />
      <Card className="w-full min-w-0 overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base">Perfil e identidad</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pt-5 text-sm">
          <div className="flex w-full min-w-0 flex-col items-stretch gap-6 lg:flex-row lg:items-center">
            <div className="flex w-full flex-col items-center gap-3 lg:w-[22rem] lg:shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Opciones de foto de perfil"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar del usuario"
                        className="size-36 rounded-full border object-cover shadow-sm sm:size-48 lg:size-64"
                      />
                    ) : (
                      <div className="flex size-36 items-center justify-center rounded-full border bg-muted sm:size-48 lg:size-64">
                        <UserCircle2 className="size-14 text-muted-foreground sm:size-20 lg:size-24" />
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="min-w-52 w-auto">
                  <DropdownMenuItem onClick={() => setPhotoViewerOpen(true)} disabled={!avatarUrl}>Ver foto</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => avatarInputRef.current?.click()} disabled={uploadAvatarMutation.isPending}>Cambiar foto de perfil</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onAvatarFileSelect}
                disabled={uploadAvatarMutation.isPending}
              />
              {uploadAvatarMutation.isPending && (
                <p className="inline-flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
                  <Loader2 className="size-3 animate-spin" />
                  Subiendo nueva foto...
                </p>
              )}
            </div>

            <div className="w-full min-w-0 flex-1 space-y-4">
              <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Nombres</p>
                  <p className="mt-1 font-medium">{displayOrFallback(identity.first_name)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Apellidos</p>
                  <p className="mt-1 font-medium">{displayOrFallback(identity.last_name)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Correo</p>
                  <p className="mt-1 font-medium break-all">{identity.email}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Rol</p>
                  <p className="mt-1 font-medium">{roleLabel[identity.role]}</p>
                </div>

                {identity.role === 'worker' && (
                  <div className="rounded-md border p-3 sm:col-span-2">
                    <p className="text-muted-foreground">Profesion</p>
                    <p className="mt-1 font-medium">{displayOrFallback(identity.profession)}</p>
                  </div>
                )}

                {identity.role === 'client' && (
                  <>
                    {identity.company_name?.trim() ? (
                      <div className="rounded-md border p-3 sm:col-span-2">
                        <p className="text-muted-foreground">Empresa</p>
                        <p className="mt-1 font-medium">{identity.company_name}</p>
                      </div>
                    ) : null}
                    <div className="rounded-md border p-3 sm:col-span-2">
                      <p className="text-muted-foreground">Tipo de cliente</p>
                      <p className="mt-1 font-medium">{displayOrFallback(identity.client_kind)}</p>
                    </div>
                  </>
                )}
              </div>

              <div className={isVerified ? 'rounded-md border border-emerald-200 bg-emerald-50/60 p-3' : 'rounded-md border border-amber-200 bg-amber-50/60 p-3'}>
                <div className="flex items-center gap-2">
                  {isVerified ? <CheckCircle2 className="size-4 text-emerald-600" /> : <MailWarning className="size-4 text-amber-700" />}
                  <p className="font-medium">Estado de verificacion</p>
                  <Badge className={isVerified ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                    {isVerified ? 'Verificado' : 'Pendiente de verificacion'}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {isVerified
                    ? 'Tu cuenta ya cumple el requisito de verificacion de correo.'
                    : 'Debes verificar tu correo para completar la seguridad de la cuenta.'}
                </p>
                {!isVerified && (
                  <Button
                    type="button"
                    variant="default"
                    className="mt-3 h-9"
                    disabled={verifyMutation.isPending}
                    onClick={() => verifyMutation.mutate()}
                  >
                    {verifyMutation.isPending ? 'Enviando...' : 'Enviar enlace de verificacion'}
                  </Button>
                )}
              </div>

              <div className="rounded-md border p-3">
                <p className="font-medium">Acceso y contrasena</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Si no puedes ingresar o necesitas restablecer tu clave, gestiona la recuperacion desde aqui.
                </p>
                <Button asChild variant="outline" className="mt-3 h-9">
                  <Link to="/forgot-password">Recuperar contrasena</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        {uploadAvatarMutation.isError && (
          <CardContent className="border-t pt-4">
            <Alert variant="destructive">
              <AlertTitle>No se pudo actualizar el avatar</AlertTitle>
              <AlertDescription>{uploadAvatarMutation.error.message}</AlertDescription>
            </Alert>
          </CardContent>
        )}

        {verifyMutation.isSuccess && (
          <CardContent className="border-t pt-4">
            <Alert>
              <AlertTitle>Verificacion enviada</AlertTitle>
              <AlertDescription>
                {verifyMutation.data.message} Revisa tu correo y abre el enlace.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}

        {verifyMutation.isError && (
          <CardContent className="border-t pt-4">
            <Alert variant="destructive">
              <AlertTitle>No se pudo enviar la verificacion</AlertTitle>
              <AlertDescription>{verifyMutation.error.message}</AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      <Dialog open={photoViewerOpen} onOpenChange={setPhotoViewerOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] max-w-xl sm:w-full">
          <DialogHeader>
            <DialogTitle>Foto de perfil</DialogTitle>
            <DialogDescription>Vista previa de tu avatar actual.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center px-6 pb-6">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Foto de perfil actual" className="size-72 max-w-full rounded-full border object-cover shadow-sm" />
            ) : (
              <div className="flex size-72 max-w-full items-center justify-center rounded-full border bg-muted">
                <UserCircle2 className="size-20 text-muted-foreground" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedImageSrc)} onOpenChange={(open) => !open && setSelectedImageSrc(null)}>
        <DialogContent
          className={cn(
            'flex w-[calc(100vw-1rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:w-full',
            'top-[max(0.75rem,env(safe-area-inset-top))] max-h-[calc(100dvh-1.5rem)] translate-y-0',
            'sm:top-1/2 sm:max-h-[min(90dvh,100%)] sm:-translate-y-1/2',
          )}
        >
          <DialogHeader className="shrink-0 border-b pb-4">
            <DialogTitle>Editar foto de perfil</DialogTitle>
            <DialogDescription>
              Ajusta la posicion y el zoom para encuadrar tu avatar. Luego presiona Guardar.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="relative mx-auto aspect-square w-full max-h-[min(52dvh,20rem)] overflow-hidden rounded-lg border bg-black/80 sm:max-h-[22.5rem]">
              {selectedImageSrc ? (
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
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="avatar-zoom" className="text-sm text-muted-foreground">Zoom</label>
              <input
                id="avatar-zoom"
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t bg-background">
            <Button variant="outline" onClick={() => setSelectedImageSrc(null)} disabled={uploadAvatarMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={() => void onSaveCroppedAvatar()} disabled={!croppedAreaPixels || uploadAvatarMutation.isPending}>
              {uploadAvatarMutation.isPending ? (
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
    </section>
  )
}
