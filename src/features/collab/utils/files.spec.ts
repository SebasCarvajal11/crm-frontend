import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatFileSize, previewGatewayFile, downloadGatewayFile } from './files'
import * as collabFilesApi from '@/features/collab/api/collab-api.files'

describe('files utility and progress streaming', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('formatFileSize', () => {
    it('formats bytes, kilobytes, and megabytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB')
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB')
    })
  })

  describe('previewGatewayFile', () => {
    it('requests PAR access URL with preview=true and tracks stream progress', async () => {
      const mockAccessUrl = 'https://objectstorage.oci.oraclecloud.com/p/mock-par/file.pdf'
      vi.spyOn(collabFilesApi, 'getProjectFileAccessRequest').mockResolvedValue({
        data: { url: mockAccessUrl, expiresInSeconds: 600, disposition: 'inline' },
      } as never)

      const chunk1 = new TextEncoder().encode('Hello ')
      const chunk2 = new TextEncoder().encode('World')
      const totalBytes = chunk1.length + chunk2.length

      let step = 0
      const mockReader = {
        read: vi.fn().mockImplementation(async () => {
          if (step === 0) {
            step++
            return { done: false, value: chunk1 }
          }
          if (step === 1) {
            step++
            return { done: false, value: chunk2 }
          }
          return { done: true, value: undefined }
        }),
      }

      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({
          'content-length': String(totalBytes),
          'content-type': 'application/pdf',
        }),
        body: {
          getReader: () => mockReader,
        },
      }

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse))
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: vi.fn(),
      })

      const progressValues: number[] = []
      const result = await previewGatewayFile(
        'mock-token',
        'file-123',
        'document.pdf',
        (pct) => progressValues.push(pct)
      )

      expect(collabFilesApi.getProjectFileAccessRequest).toHaveBeenCalledWith('mock-token', 'file-123', true)
      expect(result.objectUrl).toBe('blob:mock-url')
      expect(result.mime).toBe('application/pdf')
      expect(result.fileName).toBe('document.pdf')
      expect(progressValues[progressValues.length - 1]).toBe(100)
    })

    it('falls back to res.blob() when body reader is unavailable', async () => {
      vi.spyOn(collabFilesApi, 'getProjectFileAccessRequest').mockResolvedValue({
        data: { url: 'https://objectstorage.oci.oraclecloud.com/p/fallback', expiresInSeconds: 600, disposition: 'inline' },
      } as never)

      const mockBlob = new Blob(['data'], { type: 'image/png' })
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'image/png' }),
          body: null,
          blob: async () => mockBlob,
        })
      )
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn().mockReturnValue('blob:fallback-url'),
        revokeObjectURL: vi.fn(),
      })

      const result = await previewGatewayFile('mock-token', 'file-img', 'image.png')
      expect(result.objectUrl).toBe('blob:fallback-url')
      expect(result.mime).toBe('image/png')
    })

    it('throws error when transfer response is not ok', async () => {
      vi.spyOn(collabFilesApi, 'getProjectFileAccessRequest').mockResolvedValue({
        data: { url: 'https://broken-url.com', expiresInSeconds: 600, disposition: 'inline' },
      } as never)

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
          headers: new Headers(),
        })
      )

      await expect(
        previewGatewayFile('mock-token', 'missing-id', 'doc.pdf')
      ).rejects.toThrow('Error al transferir el archivo (404)')
    })

    it('throws parsed API error message if access request fails due to purged file', async () => {
      vi.spyOn(collabFilesApi, 'getProjectFileAccessRequest').mockRejectedValue(
        new Error('El archivo ha sido depurado por administración para liberar espacio de almacenamiento')
      )

      await expect(
        previewGatewayFile('mock-token', 'purged-id', 'doc.pdf')
      ).rejects.toThrow('El archivo ha sido depurado por administración para liberar espacio de almacenamiento')
    })
  })

  describe('downloadGatewayFile', () => {
    it('requests PAR access URL with preview=false and initiates download trigger', async () => {
      vi.spyOn(collabFilesApi, 'getProjectFileAccessRequest').mockResolvedValue({
        data: { url: 'https://download-url.com', expiresInSeconds: 600, disposition: 'attachment' },
      } as never)

      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Headers({
          'content-length': '5',
          'content-type': 'application/pdf',
        }),
        blob: async () => new Blob(['hello']),
        body: null,
      }

      const clickSpy = vi.fn()
      const mockAnchor = {
        href: '',
        download: '',
        click: clickSpy,
      }
      const mockDocument = {
        createElement: vi.fn().mockReturnValue(mockAnchor),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        },
      }

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse))
      vi.stubGlobal('document', mockDocument)
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn().mockReturnValue('blob:download'),
        revokeObjectURL: vi.fn(),
      })

      await downloadGatewayFile('mock-token', 'file-456', 'contract.pdf')

      expect(collabFilesApi.getProjectFileAccessRequest).toHaveBeenCalledWith(
        'mock-token',
        'file-456',
        false
      )
      expect(clickSpy).toHaveBeenCalled()
    })

    it('throws parsed API error message if download access request fails', async () => {
      vi.spyOn(collabFilesApi, 'getProjectFileAccessRequest').mockRejectedValue(
        new Error('El archivo ha sido depurado por administración para liberar espacio de almacenamiento')
      )

      await expect(
        downloadGatewayFile('mock-token', 'purged-id', 'doc.pdf')
      ).rejects.toThrow('El archivo ha sido depurado por administración para liberar espacio de almacenamiento')
    })
  })
})
