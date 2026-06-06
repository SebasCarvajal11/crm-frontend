/** Sube el binario a una URL PAR (OCI/S3); no pasa por el API Gateway. */
export async function putFileToPresignedUrl(
  uploadUrl: string,
  file: File,
  mimeType: string,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mimeType || 'application/octet-stream' },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`No se pudo subir el archivo al almacenamiento (${res.status})`);
  }
}
