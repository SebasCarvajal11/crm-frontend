import type { CimaIconDefinition } from './icons/types'
import { navigationIcons } from './icons/navigation-icons'
import { actionIcons } from './icons/action-icons'
import { statusIcons } from './icons/status-icons'
import { contentIcons } from './icons/content-icons'
import { businessIcons } from './icons/business-icons'

export * from './icons/types'

export const CIMA_ICONS_DATA: Record<string, CimaIconDefinition> = {
  ...navigationIcons,
  ...actionIcons,
  ...statusIcons,
  ...contentIcons,
  ...businessIcons,
}
