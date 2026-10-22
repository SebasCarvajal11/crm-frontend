import type { DeliveryStatus } from '../api/interactions-api'

export interface DeliveryMeta {
  label: string
  /** Texto del tooltip (motivo del fallo o cuándo se reintenta). */
  tooltip: string | null
}

/** Etiqueta en español del estado de entrega; null si la interacción no tiene estado. */
export function deliveryMeta(
  status?: DeliveryStatus | string | null,
  error?: string | null
): DeliveryMeta | null {
  switch (status) {
    case 'QUEUED':
      return { label: 'Enviado (en cola)', tooltip: null }
    case 'FAILED':
      return { label: 'Falló', tooltip: error?.trim() || 'El envío falló sin detalle del error.' }
    case 'SIMULATED':
      return {
        label: 'Simulado',
        tooltip: 'El envío está en modo simulado: no salió ningún mensaje.',
      }
    case 'SKIPPED_LIMIT':
      return { label: 'Límite diario alcanzado', tooltip: 'Se reintentará mañana' }
    case 'SENT_MANUAL':
      return { label: 'Enviado por WhatsApp', tooltip: 'El equipo lo envió a mano desde WhatsApp.' }
    default:
      return null
  }
}

/** Texto del resultado del correo de prueba. */
export function testEmailResultLabel(status?: string | null): { label: string; ok: boolean } {
  switch (status) {
    case 'QUEUED':
      return { label: 'Correo de prueba enviado (en cola).', ok: true }
    case 'SIMULATED':
      return { label: 'Correo de prueba simulado: el envío real está apagado.', ok: true }
    case 'SKIPPED_LIMIT':
      return { label: 'No se envió: se alcanzó el límite diario de correos.', ok: false }
    case 'FAILED':
      return { label: 'El correo de prueba falló.', ok: false }
    default:
      return { label: `Resultado: ${status ?? 'desconocido'}.`, ok: false }
  }
}
