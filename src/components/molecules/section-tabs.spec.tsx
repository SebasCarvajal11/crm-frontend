import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { SectionTabs, type SectionTabItem } from './section-tabs'
import {
  measurePillGeometry,
  centerActiveTab,
  handleTabKeyNavigation,
} from './section-tabs-utils'

type SampleTab = 'overview' | 'settings' | 'billing'

const MOCK_TABS: SectionTabItem<SampleTab>[] = [
  {
    value: 'overview',
    label: 'Resumen',
    icon: <span data-testid="icon-overview">IconOverview</span>,
  },
  {
    value: 'settings',
    label: 'Configuración',
    icon: <span data-testid="icon-settings">IconSettings</span>,
    badge: <span data-testid="badge-settings">Nuevo</span>,
  },
  {
    value: 'billing',
    label: 'Facturación',
    icon: <span data-testid="icon-billing">IconBilling</span>,
  },
]

describe('SectionTabs', () => {
  it('renderiza todas las pestañas con sus etiquetas e iconos', () => {
    const markup = renderToStaticMarkup(
      <SectionTabs
        items={MOCK_TABS}
        value="overview"
        onValueChange={() => {}}
        ariaLabel="Navegación de prueba"
        dataTourPrefix="test-tab"
      />,
    )

    expect(markup).toContain('Resumen')
    expect(markup).toContain('Configuración')
    expect(markup).toContain('Facturación')
    expect(markup).toContain('IconOverview')
    expect(markup).toContain('Nuevo')
  })

  it('asigna rol tablist, aria-selected y roving tabindex cuando itemRole es tab', () => {
    const markup = renderToStaticMarkup(
      <SectionTabs
        items={MOCK_TABS}
        value="settings"
        onValueChange={() => {}}
        ariaLabel="Pestañas de configuración"
        itemRole="tab"
        getPanelId={(val) => `panel-${val}`}
        dataTourPrefix="tab"
      />,
    )

    expect(markup).toContain('role="tablist"')
    expect(markup).toContain('aria-selected="true"')
    expect(markup).toContain('aria-controls="panel-settings"')
    expect(markup).toContain('data-tour="tab-settings"')
    expect(markup).toContain('data-state="active"')
    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('tabindex="-1"')
  })

  it('asigna rol toolbar y aria-pressed con tabIndex 0 cuando itemRole es button', () => {
    const markup = renderToStaticMarkup(
      <SectionTabs
        items={MOCK_TABS}
        value="billing"
        onValueChange={() => {}}
        ariaLabel="Barra de herramientas"
        itemRole="button"
        dataTourPrefix="action"
      />,
    )

    expect(markup).toContain('role="toolbar"')
    expect(markup).toContain('aria-pressed="true"')
    expect(markup).toContain('data-tour="action-billing"')
    expect(markup).toContain('data-state="active"')
    expect(markup).not.toContain('tabindex="-1"')
  })

  it('incluye contenedor con posicionamiento relativo y overflow para GPU indicator', () => {
    const markup = renderToStaticMarkup(
      <SectionTabs
        items={MOCK_TABS}
        value="overview"
        onValueChange={() => {}}
        ariaLabel="Pestañas con píldora"
      />,
    )

    expect(markup).toContain('relative')
    expect(markup).toContain('overflow-x-auto')
  })

  it('tolera lista de pestañas vacía sin fallar', () => {
    const markup = renderToStaticMarkup(
      <SectionTabs
        items={[]}
        value="overview"
        onValueChange={() => {}}
        ariaLabel="Vacío"
      />,
    )

    expect(markup).toContain('role="tablist"')
    expect(markup).not.toContain('<button')
  })
})

describe('measurePillGeometry', () => {
  it('retorna null cuando el elemento target tiene dimensiones cero', () => {
    const mockContainer = {
      getBoundingClientRect: () => ({ left: 0, top: 0 }),
      clientLeft: 0,
      clientTop: 0,
      scrollLeft: 0,
      scrollTop: 0,
    } as unknown as HTMLElement

    const mockTarget = {
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
    } as unknown as HTMLElement

    expect(measurePillGeometry(mockContainer, mockTarget)).toBeNull()
  })

  it('calcula coordenadas exactas compensando scroll y bordes', () => {
    const mockContainer = {
      getBoundingClientRect: () => ({ left: 50, top: 100 }),
      clientLeft: 2,
      clientTop: 2,
      scrollLeft: 20,
      scrollTop: 0,
    } as unknown as HTMLElement

    const mockTarget = {
      getBoundingClientRect: () => ({ left: 150, top: 110, width: 80.5, height: 36 }),
    } as unknown as HTMLElement

    const geom = measurePillGeometry(mockContainer, mockTarget)
    expect(geom).not.toBeNull()
    expect(geom?.x).toBe(150 - 50 - 2 + 20) // 118
    expect(geom?.y).toBe(110 - 100 - 2 + 0) // 8
    expect(geom?.width).toBe(80.5)
    expect(geom?.height).toBe(36)
  })
})

describe('centerActiveTab', () => {
  it('no ejecuta scroll si el contenido cabe completamente en el contenedor', () => {
    const scrollToMock = vi.fn()
    const mockContainer = {
      clientWidth: 500,
      scrollWidth: 500,
      scrollTo: scrollToMock,
    } as unknown as HTMLElement

    centerActiveTab(mockContainer, 100, 80)
    expect(scrollToMock).not.toHaveBeenCalled()
  })

  it('centra la pestaña dentro del rango válido de scroll', () => {
    const scrollToMock = vi.fn()
    const mockContainer = {
      clientWidth: 300,
      scrollWidth: 800,
      scrollTo: scrollToMock,
    } as unknown as HTMLElement

    // pillX = 200, width = 100 -> targetScroll = 200 - (300 - 100)/2 = 100
    centerActiveTab(mockContainer, 200, 100, 'smooth')
    expect(scrollToMock).toHaveBeenCalledWith({
      left: 100,
      behavior: 'smooth',
    })
  })
})

describe('handleTabKeyNavigation', () => {
  it('navega hacia la derecha ciclando al inicio al llegar al final', () => {
    const onSelect = vi.fn()
    const focusMock = vi.fn()
    const tabRefs = new Map<SampleTab, HTMLButtonElement>()
    tabRefs.set('settings', { focus: focusMock } as unknown as HTMLButtonElement)

    const event = {
      key: 'ArrowRight',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLButtonElement>

    handleTabKeyNavigation({
      event,
      currentIndex: 0,
      items: MOCK_TABS,
      tabRefs,
      onSelect,
    })

    expect(event.preventDefault).toHaveBeenCalled()
    expect(onSelect).toHaveBeenCalledWith('settings')
    expect(focusMock).toHaveBeenCalled()
  })

  it('navega hacia la izquierda ciclando al último al estar en el primero', () => {
    const onSelect = vi.fn()
    const focusMock = vi.fn()
    const tabRefs = new Map<SampleTab, HTMLButtonElement>()
    tabRefs.set('billing', { focus: focusMock } as unknown as HTMLButtonElement)

    const event = {
      key: 'ArrowLeft',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLButtonElement>

    handleTabKeyNavigation({
      event,
      currentIndex: 0,
      items: MOCK_TABS,
      tabRefs,
      onSelect,
    })

    expect(event.preventDefault).toHaveBeenCalled()
    expect(onSelect).toHaveBeenCalledWith('billing')
    expect(focusMock).toHaveBeenCalled()
  })
})
