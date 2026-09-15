import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { useAccountProfileSection } from '@/features/auth/hooks'
import type { MeResponse } from '@/features/auth/model'
import { ProfileAvatarDialogs } from './profile-avatar-dialogs'
import { ProfileDetails } from './profile-details'
import { ProfileHero } from './profile-hero'

type Props = {
  accessToken: string
  identity: MeResponse['data']
}

const toDisplayName = (value: string) =>
  value.replace(/(^|[-._\s])\p{L}/gu, (character) => character.toUpperCase())

export function ProfileSection({ accessToken, identity }: Props) {
  const isVerified = Boolean(identity.emailVerifiedAt)
  const fullName = [identity.first_name, identity.last_name].filter(Boolean).join(' ')
  const displayName = fullName || toDisplayName(identity.email.split('@')[0])

  const {
    avatarInputRef,
    avatarUrl,
    clearSelectedImage,
    crop,
    croppedAreaPixels,
    onAvatarFileSelect,
    onCropComplete,
    onSaveCroppedAvatar,
    photoViewerOpen,
    selectedImageSrc,
    setCrop,
    setPhotoViewerOpen,
    setZoom,
    uploadAvatarMutation,
    verifyMutation,
    zoom,
  } = useAccountProfileSection(accessToken)

  return (
    <section className="w-full min-w-0 space-y-4">
      {/* Cabecera visual con avatar e identidad */}
      <ProfileHero
        identity={identity}
        displayName={displayName}
        avatarUrl={avatarUrl}
        isVerified={isVerified}
        isUploading={uploadAvatarMutation.isPending}
        avatarInputRef={avatarInputRef}
        onAvatarFileSelect={onAvatarFileSelect}
        onOpenPhotoViewer={() => setPhotoViewerOpen(true)}
      />

      {/* Tarjeta de detalles y datos de perfil */}
      <Card className="w-full min-w-0 overflow-hidden rounded-2xl border-border/80 shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <ProfileDetails
            identity={identity}
            isVerified={isVerified}
            isSendingVerification={verifyMutation.isPending}
            onSendVerification={() => verifyMutation.mutate()}
          />
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

      {/* Modales de visor y recorte de avatar */}
      <ProfileAvatarDialogs
        avatarUrl={avatarUrl}
        photoViewerOpen={photoViewerOpen}
        setPhotoViewerOpen={setPhotoViewerOpen}
        selectedImageSrc={selectedImageSrc}
        clearSelectedImage={clearSelectedImage}
        crop={crop}
        setCrop={setCrop}
        zoom={zoom}
        setZoom={setZoom}
        onCropComplete={onCropComplete}
        onSaveCroppedAvatar={onSaveCroppedAvatar}
        hasCroppedArea={Boolean(croppedAreaPixels)}
        isUploading={uploadAvatarMutation.isPending}
      />
    </section>
  )
}
