import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Area, Point } from 'react-easy-crop'
import { getCurrentAvatarRequestOptional, uploadAvatarRequest } from '@/shared/api'
import { parseApiError } from '@/features/auth/utils'
import { useEmailVerificationRequest } from './use-email-verification'

const avatarQueryKey = (token: string) => ['media', 'avatar', 'current', token] as const

function getCroppedFileViaWorker(imageSrc: string, pixelCrop: Area): Promise<File> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('../workers/image-crop.worker.ts', import.meta.url),
      { type: 'module' },
    )

    worker.onmessage = (e: MessageEvent<{ ok: boolean; blob?: Blob; error?: string }>) => {
      worker.terminate()
      if (e.data.ok && e.data.blob) {
        resolve(new File([e.data.blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' }))
      } else {
        reject(new Error(e.data.error ?? 'Error al recortar imagen'))
      }
    }

    worker.onerror = (err) => {
      worker.terminate()
      reject(new Error(err.message ?? 'Error en worker de recorte'))
    }

    worker.postMessage({ imageSrc, pixelCrop })
  })
}

export function useAccountProfileSection(accessToken: string) {
  const queryClient = useQueryClient()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  // Tracks the previous blob URL so it can be revoked before a new one is assigned,
  // preventing accumulative memory leaks when the user selects multiple files.
  const prevBlobUrlRef = useRef<string | null>(null)
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null)
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false)
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  useEffect(() => {
    return () => {
      if (prevBlobUrlRef.current) {
        URL.revokeObjectURL(prevBlobUrlRef.current)
      }
    }
  }, [])

  const avatarQ = useQuery({
    queryKey: avatarQueryKey(accessToken),
    queryFn: () => getCurrentAvatarRequestOptional(accessToken),
    retry: false,
  })

  const avatarUrl = useMemo(() => {
    const urls = avatarQ.data?.data.urls
    return urls?.['512'] ?? urls?.['256'] ?? urls?.['64'] ?? null
  }, [avatarQ.data])

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      try {
        return await uploadAvatarRequest(accessToken, file)
      } catch (e) {
        throw new Error(await parseApiError(e), { cause: e })
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: avatarQueryKey(accessToken) })
      setSelectedImageSrc(null)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
    },
  })

  const verifyMutation = useEmailVerificationRequest(accessToken)

  const onCropComplete = (_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }

  const onAvatarFileSelect: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Revoke the previous blob URL immediately to free browser Blob memory
    // before assigning the new one, regardless of whether upload completes.
    if (prevBlobUrlRef.current) {
      URL.revokeObjectURL(prevBlobUrlRef.current)
    }

    const src = URL.createObjectURL(file)
    prevBlobUrlRef.current = src
    setSelectedImageSrc(src)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    event.currentTarget.value = ''
  }

  const clearSelectedImage = () => {
    if (prevBlobUrlRef.current) {
      URL.revokeObjectURL(prevBlobUrlRef.current)
      prevBlobUrlRef.current = null
    }
    setSelectedImageSrc(null)
  }

  const onSaveCroppedAvatar = async () => {
    if (!selectedImageSrc || !croppedAreaPixels) return
    const file = await getCroppedFileViaWorker(selectedImageSrc, croppedAreaPixels)
    uploadAvatarMutation.mutate(file)
  }

  return {
    avatarInputRef,
    avatarQ,
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
    setSelectedImageSrc,
    setZoom,
    uploadAvatarMutation,
    verifyMutation,
    zoom,
  }
}
