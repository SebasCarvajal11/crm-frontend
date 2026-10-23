import {
  Activity,
  Bell,
  Mail,
  MessageSquare,
  MessageSquarePlus,
  type LucideIcon,
} from 'lucide-react'
import type { TriggerType, ActionType } from '../api/marketing-api'

export const TRIGGER_TYPES: {
  value: TriggerType
  label: string
  /** Línea de ayuda en lenguaje simple bajo el selector. */
  help: string
}[] = [
  {
    value: 'scheduled_date',
    label: 'Fecha y hora programada',
    help: 'Se envía una vez cuando llegue esa fecha y hora.',
  },
  {
    value: 'no_contact_x_days',
    label: 'Sin contacto (X días)',
    help: 'Se repite como máximo una vez cada X días por cliente.',
  },
  {
    value: 'proposal_no_response',
    label: 'Propuesta sin respuesta',
    help: 'Se repite como máximo una vez cada X días por cliente.',
  },
  {
    value: 'project_completed',
    label: 'Proyecto finalizado',
    help: 'Una vez, cuando el cliente termine un proyecto.',
  },
  {
    value: 'manual',
    label: 'Disparo manual',
    help: 'Solo corre cuando pulses Ejecutar ahora; cada vez le llega a toda la audiencia.',
  },
]

export const ACTION_TYPES: { value: ActionType; label: string; help: string; icon: LucideIcon }[] = [
  { value: 'send_email', label: 'Correo electrónico', help: 'Le llega un correo al cliente.', icon: Mail },
  {
    value: 'send_portal_message',
    label: 'Mensaje al portal del cliente',
    help: 'Le llega en Mensajes con CIMA de su portal.',
    icon: MessageSquarePlus,
  },
  {
    value: 'send_whatsapp',
    label: 'Mensaje WhatsApp',
    help: 'Queda en la lista WhatsApp por enviar del panel Hoy.',
    icon: MessageSquare,
  },
  {
    value: 'log_followup',
    label: 'Registrar seguimiento',
    help: 'Nota interna, no le escribe al cliente.',
    icon: Activity,
  },
  {
    value: 'notify_admin',
    label: 'Notificar al administrador',
    help: 'Correo de alerta al buzón de CIMA.',
    icon: Bell,
  },
]
