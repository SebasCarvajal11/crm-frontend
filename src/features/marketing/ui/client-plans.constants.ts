import { Crown, Gem, Sparkles } from 'lucide-react'
import type { ClientPlan, MarketingClient } from '../api/clients-api'

export const PLANS: { value: ClientPlan; label: string; icon: typeof Crown; chip: string }[] = [
  {
    value: 'Platinum',
    label: 'Platinum',
    icon: Gem,
    chip: 'bg-slate-50 text-slate-800 border-slate-300',
  },
  {
    value: 'Oro',
    label: 'Oro',
    icon: Crown,
    chip: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  {
    value: 'Diamante',
    label: 'Diamante',
    icon: Sparkles,
    chip: 'bg-sky-50 text-sky-800 border-sky-300',
  },
]

export function planMeta(plan?: string | null) {
  return PLANS.find((p) => p.value === plan) ?? null
}

export function clientLabel(client: MarketingClient) {
  return client.contactInfo || client.additionalInfo || client.clientId
}
