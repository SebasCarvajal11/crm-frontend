import {
  Activity,
  Bell,
  Mail,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react'
import type { TriggerType, ActionType } from '../api/marketing-api'

export const TRIGGER_TYPES: { value: TriggerType; label: string; description: string }[] = [
  {
    value: 'no_contact_x_days',
    label: 'Sin Contacto (X días)',
    description: 'Se dispara si pasan X días sin interacción',
  },
  {
    value: 'scheduled_date',
    label: 'Fecha Programada',
    description: 'Se dispara en una fecha y hora específica',
  },
  {
    value: 'proposal_no_response',
    label: 'Propuesta sin Respuesta',
    description: 'Se dispara tras enviar cotización sin feedback',
  },
  {
    value: 'project_completed',
    label: 'Proyecto Finalizado',
    description: 'Se dispara al cerrar un proyecto con el cliente',
  },
  {
    value: 'manual',
    label: 'Disparo Manual',
    description: 'Activado por demanda por el equipo',
  },
]

export const ACTION_TYPES: { value: ActionType; label: string; icon: LucideIcon }[] = [
  { value: 'send_whatsapp', label: 'Mensaje WhatsApp', icon: MessageSquare },
  { value: 'send_email', label: 'Correo Electrónico', icon: Mail },
  { value: 'log_followup', label: 'Registrar Seguimiento', icon: Activity },
  { value: 'notify_admin', label: 'Notificar al Administrador', icon: Bell },
]
