/** Sube el binario a una URL PAR (OCI/S3) con reporte de progreso opcional. */
export function putFileToPresignedUrl(
  uploadUrl: string,
  file: File,
  mimeType: string,
  onProgress?: (percentage: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl, true)
    xhr.setRequestHeader('Content-Type', mimeType || 'application/octet-stream')

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const pct = Math.min(100, Math.round((event.loaded / event.total) * 100))
          onProgress(pct)
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100)
        resolve()
      } else {
        reject(new Error(`No se pudo subir el archivo al almacenamiento (${xhr.status})`))
      }
    }

    xhr.onerror = () => {
      reject(new Error('Error de red durante la subida al almacenamiento'))
    }

    xhr.ontimeout = () => {
      reject(new Error('Tiempo de espera agotado al subir el archivo'))
    }

    xhr.send(file)
  })
}

