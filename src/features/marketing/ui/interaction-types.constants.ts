import type { InteractionType } from '../api/interactions-api'

export const INTERACTION_TYPES: {
  value: InteractionType
  label: string
  esRespuesta: boolean
  chip: string
}[] = [
  {
    value: 'no_response',
    label: 'Sin respuesta',
    esRespuesta: false,
    chip: 'bg-muted text-muted-foreground border-border',
  },
  {
    value: 'message',
    label: 'Mensaje enviado',
    esRespuesta: false,
    chip: 'bg-primary/10 text-primary border-primary/30',
  },
  {
    value: 'open',
    label: 'Abrió el correo',
    esRespuesta: false,
    chip: 'bg-sky-50 text-sky-800 border-sky-300',
  },
  {
    value: 'click',
    label: 'Hizo clic',
    esRespuesta: true,
    chip: 'bg-sky-50 text-sky-800 border-sky-300',
  },
  {
    value: 'inquiry',
    label: 'Consultó',
    esRespuesta: true,
    chip: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  {
    value: 'purchase',
    label: 'Compró',
    esRespuesta: true,
    chip: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  {
    value: 'testimonial',
    label: 'Dio testimonio',
    esRespuesta: true,
    chip: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
]

export const TIPOS_RESPUESTA: InteractionType[] = [
  'click',
  'inquiry',
  'purchase',
  'testimonial',
]

export function typeMeta(type: InteractionType) {
  return INTERACTION_TYPES.find((t) => t.value === type) ?? INTERACTION_TYPES[0]
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

/** Fecha y hora por separado, para mostrarlas en dos líneas cortas en la tabla. */
export function splitDateTime(value?: string | null): { date: string; time: string } {
  if (!value) return { date: '—', time: '' }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return { date: '—', time: '' }
  return {
    date: new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(d),
    time: new Intl.DateTimeFormat('es-CO', { timeStyle: 'short' }).format(d),
  }
}

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  email: 'Correo',
  correo: 'Correo',
  llamada: 'Llamada',
  reunion: 'Reunión',
  redes: 'Redes sociales',
  in_app: 'En la aplicación',
  otro: 'Otro',
}

/** Nombre legible del canal guardado en la interacción ("whatsapp" → "WhatsApp"). */
export function channelDisplay(channel?: string | null): string {
  if (!channel?.trim()) return '—'
  const key = channel.trim().toLowerCase()
  return CHANNEL_LABELS[key] ?? channel.trim().charAt(0).toUpperCase() + channel.trim().slice(1)
}
