import { useEffect, type RefObject } from 'react'

/**
 * Hook para restaurar la posición del scroll al inicio (0, 0)
 * de forma instantánea al montar la vista o cambiar de pestaña.
 */
export function useScrollToTop(
  dependency: unknown,
  containerRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    // Restablece el scroll de la ventana global
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }

    // Restablece el scroll del contenedor principal si existe
    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    }
  }, [dependency, containerRef])
}
