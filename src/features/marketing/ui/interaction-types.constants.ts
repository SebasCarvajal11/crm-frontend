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
