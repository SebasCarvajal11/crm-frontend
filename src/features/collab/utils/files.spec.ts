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

      const chunk1 = new Uint8Array([1, 2, 3, 4, 5])
      const chunk2 = new Uint8Array([6, 7, 8, 9, 10])
      const totalBytes = 10

      let readCount = 0
      const mockReader = {
        read: vi.fn().mockImplementation(async () => {
          readCount++
          if (readCount === 1) return { done: false, value: chunk1 }
          if (readCount === 2) return { done: false, value: chunk2 }
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
        createObjectURL: vi.fn().mockReturnValue('blob:http://localhost:5173/mock-blob-uuid'),
        revokeObjectURL: vi.fn(),
      })

      const progressSnapshots: number[] = []
      const result = await previewGatewayFile(
        'mock-token',
        'file-123',
        'report.pdf',
        (percent) => progressSnapshots.push(percent)
      )

      expect(collabFilesApi.getProjectFileAccessRequest).toHaveBeenCalledWith('mock-token', 'file-123', true)
      expect(result.fileName).toBe('report.pdf')
      expect(result.mime).toBe('application/pdf')
      expect(result.objectUrl).toBe('blob:http://localhost:5173/mock-blob-uuid')
      expect(progressSnapshots).toContain(50)
      expect(progressSnapshots).toContain(100)
    })

    it('throws descriptive error if storage fetch fails', async () => {
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
  })
})
