import {
  FileText,
  Handshake,
  Search,
  Send,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import type { ProposalStatus, CreateProposalInput } from '../api/proposals-api'

export const PROPOSAL_STATUSES: {
  value: ProposalStatus
  label: string
  description: string
  icon: typeof FileText
  chip: string
  dot: string
}[] = [
  {
    value: 'In_diagnosis',
    label: 'En diagnóstico',
    description: 'Levantando requerimientos del cliente',
    icon: Search,
    chip: 'bg-muted text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
  {
    value: 'Sent',
    label: 'Enviada',
    description: 'A la espera de respuesta del cliente',
    icon: Send,
    chip: 'bg-primary/10 text-primary border-primary/30',
    dot: 'bg-primary',
  },
  {
    value: 'In_negotiation',
    label: 'En negociación',
    description: 'Ajustando alcance o condiciones',
    icon: Handshake,
    chip: 'bg-amber-50 text-amber-800 border-amber-300',
    dot: 'bg-amber-500',
  },
  {
    value: 'Approved',
    label: 'Aprobada',
    description: 'Aceptada por el cliente',
    icon: CheckCircle2,
    chip: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-600',
  },
  {
    value: 'Rejected',
    label: 'Rechazada',
    description: 'No aceptada',
    icon: XCircle,
    chip: 'bg-rose-50 text-rose-800 border-rose-300',
    dot: 'bg-destructive',
  },
]

export const ESTADOS_PENDIENTES: ProposalStatus[] = ['Sent', 'In_negotiation']
export const UMBRAL_SIN_RESPUESTA_DIAS = 15

export function statusMeta(status: ProposalStatus) {
  return PROPOSAL_STATUSES.find((s) => s.value === status) ?? PROPOSAL_STATUSES[0]
}

export function formatCurrency(value?: number | null): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(value))
}

export function diasDesde(value?: string | null): number | null {
  if (!value) return null
  const dias = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000)
  return Number.isFinite(dias) ? dias : null
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export const EMPTY_FORM: CreateProposalInput = {
  clientId: '',
  description: '',
  documentUrl: '',
  status: 'In_diagnosis',
  estimatedValue: null,
  createdDate: todayISO(),
}

export function mensajeDeError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    return 'No se pudo guardar la propuesta. Verifique que el cliente exista en el CRM.'
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado.'
}
