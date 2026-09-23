/**
 * Supervisor de modales y diálogos para CIMA Smart Copilot.
 * Detecta la presencia de modales de la aplicación para pausar
 * temporalmente el tour y reanudarlo cuando el modal se cierra.
 * Ignora explícitamente el popover de Driver.js y el centro de ayuda.
 */

type ModalSupervisorCallbacks = {
  onModalOpen: (modalEl: Element) => void
  onModalClose: () => void
}

let observer: MutationObserver | null = null
let activeModalCount = 0

function isDriverPopover(el: Element): boolean {
  return (
    Boolean(el.classList?.contains('driver-popover')) ||
    Boolean(el.closest?.('.driver-popover')) ||
    el.id === 'driver-popover-content'
  )
}

function isHelpCenterDialog(el: Element): boolean {
  return (
    el.getAttribute('aria-labelledby') === 'cima-help-title' ||
    Boolean(el.querySelector?.('#cima-help-title'))
  )
}

function isAppDialog(node: unknown): boolean {
  if (!node || typeof (node as Element).getAttribute !== 'function') return false
  const el = node as Element

  if (isDriverPopover(el) || isHelpCenterDialog(el)) return false

  const isDialog =
    el.getAttribute('role') === 'dialog' ||
    Boolean(el.classList?.contains('dialog-content')) ||
    Boolean(el.querySelector?.('[role="dialog"]:not(.driver-popover)'))

  return Boolean(isDialog)
}

function scanAppDialogs(): Element[] {
  if (typeof document === 'undefined') return []
  const dialogs = Array.from(
    document.querySelectorAll('[role="dialog"]:not(.driver-popover):not(#driver-popover-content)')
  )
  return dialogs.filter((d) => !isHelpCenterDialog(d))
}

export function startModalSupervisor(callbacks: ModalSupervisorCallbacks): () => void {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => {}
  }
  stopModalSupervisor()

  const checkDialogs = () => {
    const dialogs = scanAppDialogs()
    if (dialogs.length > 0 && activeModalCount === 0) {
      activeModalCount = dialogs.length
      callbacks.onModalOpen(dialogs[0])
    } else if (dialogs.length === 0 && activeModalCount > 0) {
      activeModalCount = 0
      callbacks.onModalClose()
    }
  }

  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      const added = Array.from(m.addedNodes).some(isAppDialog)
      const removed = Array.from(m.removedNodes).some(isAppDialog)
      if (added || removed) {
        checkDialogs()
        break
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
  checkDialogs()

  return stopModalSupervisor
}

export function stopModalSupervisor(): void {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  activeModalCount = 0
}
