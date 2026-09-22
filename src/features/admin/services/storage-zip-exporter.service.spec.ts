import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sanitizePathSegment,
  buildManifestContent,
  exportProjectFilesAsZip,
} from './storage-zip-exporter.service'
import * as adminStorageApi from '@/features/admin/api/admin-storage-explorer.api'
import * as sharedLib from '@/shared/lib'
import type { StorageFileItem } from '@/features/admin/api/admin-storage-explorer.api'

function createMockFile(overrides: Partial<StorageFileItem>): StorageFileItem {
  return {
    id: 'file-1',
    projectId: 'proj-1',
    projectName: 'Proyecto Demo',
    fileName: 'archivo.pdf',
    title: null,
    folder: 'contracts',
    storagePath: '/storage/path',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
    version: 1,
    isClientVisible: true,
    isPurged: false,
    purgedAt: null,
    purgedReason: null,
    createdByEmail: 'admin@cima.dev',
    createdAt: '2026-09-01T00:00:00Z',
    taskId: null,
    taskTitle: null,
    isSignedContract: false,
    ...overrides,
  }
}

describe('storage-zip-exporter.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('sanitizePathSegment', () => {
    it('elimina caracteres ilegales en sistemas de archivos', () => {
      expect(sanitizePathSegment('Carpeta/Con\\Barras:Y?Asterisco*')).toBe(
        'Carpeta_Con_Barras_Y_Asterisco_'
      )
    })

    it('devuelve "archivo" como fallback para cadenas vacías', () => {
      expect(sanitizePathSegment('')).toBe('archivo')
      expect(sanitizePathSegment('   ')).toBe('archivo')
    })
  })

  describe('buildManifestContent', () => {
    const mockFiles: StorageFileItem[] = [
      createMockFile({
        id: 'file-1',
        fileName: 'contrato.pdf',
        folder: 'contracts',
        sizeBytes: 1024,
        isPurged: false,
        isSignedContract: true,
      }),
      createMockFile({
        id: 'file-2',
        fileName: 'antiguo.png',
        folder: 'mockups',
        sizeBytes: 2048,
        isPurged: true,
      }),
    ]

    it('genera manifiesto JSON con totales desagregados de activos y purgados', () => {
      const json = buildManifestContent('Cliente CIMA', 'Proyecto Alpha', mockFiles)
      const parsed = JSON.parse(json)

      expect(parsed.cliente).toBe('Cliente CIMA')
      expect(parsed.proyecto).toBe('Proyecto Alpha')
      expect(parsed.resumen.totalArchivosEmpaquetados).toBe(1)
      expect(parsed.resumen.pesoTotalBytes).toBe(1024)
      expect(parsed.resumen.totalArchivosPurgadosHistoricos).toBe(1)
      expect(parsed.archivos[0].nombre).toBe('contrato.pdf')
      expect(parsed.archivos[0].carpeta).toBe('Contratos y Adendas')
    })
  })

  describe('exportProjectFilesAsZip', () => {
    it('arroja error si no hay archivos activos para descargar', async () => {
      const files: StorageFileItem[] = [
        createMockFile({
          id: 'file-1',
          fileName: 'purged.png',
          isPurged: true,
        }),
      ]

      await expect(
        exportProjectFilesAsZip({
          accessToken: 'test-token',
          clientName: 'Cliente',
          projectName: 'Proyecto',
          files,
        })
      ).rejects.toThrow('No hay archivos activos para descargar en este proyecto.')
    })

    it('descarga archivos, construye zip y notifica progreso', async () => {
      const mockFiles: StorageFileItem[] = [
        createMockFile({
          id: 'file-1',
          fileName: 'diseño.png',
          folder: 'mockups',
          mimeType: 'image/png',
          sizeBytes: 100,
        }),
      ]

      vi.spyOn(adminStorageApi, 'getStorageFileAccess').mockResolvedValue({
        url: 'https://oci.example.com/par-url',
        expiresInSeconds: 3600,
      })

      const mockBlob = new Blob(['mock-binary-content'], { type: 'image/png' })
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        blob: async () => mockBlob,
      } as unknown as Response)

      const triggerSpy = vi.spyOn(sharedLib, 'triggerBlobDownload').mockImplementation(() => {})

      const progressEvents: number[] = []
      const zipBlob = await exportProjectFilesAsZip({
        accessToken: 'test-token',
        clientName: 'Cliente CIMA',
        projectName: 'Proyecto Campaña',
        files: mockFiles,
        onProgress: (p) => progressEvents.push(p.percent),
      })

      expect(adminStorageApi.getStorageFileAccess).toHaveBeenCalledWith('test-token', 'file-1')
      expect(triggerSpy).toHaveBeenCalledWith(expect.any(Blob), 'Proyecto Campaña_respaldo.zip')
      expect(zipBlob).toBeInstanceOf(Blob)
      expect(progressEvents).toContain(100)
    })
  })
})
