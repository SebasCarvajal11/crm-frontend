import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  applyDocumentZoom,
  getStoredZoom,
  persistZoom,
  findClosestZoomStep,
  ZOOM_STORAGE_KEY,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  DESKTOP_MAX_ZOOM,
  ZOOM_STEPS,
} from './use-accessibility-zoom'

describe('use-accessibility-zoom helpers', () => {
  let mockStore: Record<string, string> = {}
  let originalWindow: typeof globalThis.window
  let originalDocument: typeof globalThis.document

  beforeEach(() => {
    mockStore = {}
    originalWindow = globalThis.window
    originalDocument = globalThis.document

    const mockStorage = {
      getItem: (key: string) => mockStore[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStore[key] = val
      },
      clear: () => {
        mockStore = {}
      },
    }

    const mockStyleObj: Record<string, string> = { zoom: '' }

    // Mock window & document for Node test environment
    globalThis.window = {
      localStorage: mockStorage as unknown as Storage,
      innerWidth: 1200,
    } as unknown as Window & typeof globalThis

    globalThis.document = {
      documentElement: {
        style: {
          get zoom() {
            return mockStyleObj.zoom
          },
          set zoom(val: string) {
            mockStyleObj.zoom = val
          },
          setProperty: (k: string, v: string) => {
            mockStyleObj[k] = v
          },
          getPropertyValue: (k: string) => mockStyleObj[k] || '',
          removeProperty: (k: string) => {
            delete mockStyleObj[k]
            return ''
          },
        },
      },
    } as unknown as Document
  })

  afterEach(() => {
    globalThis.window = originalWindow
    globalThis.document = originalDocument
  })

  it('findClosestZoomStep matches nearest supported step', () => {
    expect(findClosestZoomStep(0.75)).toBe(0.8)
    expect(findClosestZoomStep(1.02)).toBe(1.0)
    expect(findClosestZoomStep(1.2)).toBe(1.25)
    expect(findClosestZoomStep(1.9)).toBe(2.0)
  })

  it('getStoredZoom returns default when storage is empty', () => {
    expect(getStoredZoom()).toBe(DEFAULT_ZOOM)
  })

  it('persistZoom saves value and getStoredZoom retrieves it', () => {
    persistZoom(1.25)
    expect(globalThis.window.localStorage.getItem(ZOOM_STORAGE_KEY)).toBe('1.25')
    expect(getStoredZoom()).toBe(1.25)
  })

  it('getStoredZoom gracefully handles invalid stored string', () => {
    globalThis.window.localStorage.setItem(ZOOM_STORAGE_KEY, 'not-a-number')
    expect(getStoredZoom()).toBe(DEFAULT_ZOOM)
  })

  it('applyDocumentZoom sets documentElement zoom and CSS variable', () => {
    applyDocumentZoom(1.5)
    expect(document.documentElement.style.zoom).toBe('1.5')
    expect(document.documentElement.style.getPropertyValue('--app-zoom')).toBe('1.5')
  })

  it('applyDocumentZoom clamps values exceeding max or min', () => {
    applyDocumentZoom(0.5)
    expect(document.documentElement.style.zoom).toBe(String(MIN_ZOOM))

    applyDocumentZoom(3.5)
    expect(document.documentElement.style.zoom).toBe(String(DESKTOP_MAX_ZOOM))
  })

  it('validates zoom step boundaries conform to WCAG 200% requirement', () => {
    expect(ZOOM_STEPS[0]).toBe(0.8)
    expect(ZOOM_STEPS[ZOOM_STEPS.length - 1]).toBe(2.0)
    expect(ZOOM_STEPS).toContain(1.0)
  })
})
