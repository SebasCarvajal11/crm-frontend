import { Crown, Gem, Sparkles } from 'lucide-react'
import type { ClientPlan, MarketingClient } from '../api/clients-api'

export const PLANS: { value: ClientPlan; label: string; icon: typeof Crown; chip: string }[] = [
  {
    value: 'Oro',
    label: 'Oro',
    icon: Crown,
    chip: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  {
    value: 'Esmeralda',
    label: 'Esmeralda',
    icon: Gem,
    chip: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  },
  {
    value: 'Premium',
    label: 'Premium',
    icon: Sparkles,
    chip: 'bg-violet-50 text-violet-800 border-violet-300',
  },
]

export function planMeta(plan?: string | null) {
  return PLANS.find((p) => p.value === plan) ?? null
}

export function clientLabel(client: MarketingClient) {
  return client.contactInfo || client.additionalInfo || client.clientId
}
