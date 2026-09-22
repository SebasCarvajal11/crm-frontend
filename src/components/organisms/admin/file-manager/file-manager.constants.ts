export interface FolderMeta {
  key: string
  label: string
  badgeClass: string
}

export const FOLDER_CONFIGS: Record<string, FolderMeta> = {
  contracts: {
    key: 'contracts',
    label: 'Contratos y Adendas',
    badgeClass: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  },
  final_arts: {
    key: 'final_arts',
    label: 'Entregables y Artes Finales',
    badgeClass: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400',
  },
  mockups: {
    key: 'mockups',
    label: 'Bocetos y Mockups',
    badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  briefs: {
    key: 'briefs',
    label: 'Briefs y Requerimientos',
    badgeClass: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400',
  },
  shared_deliverables: {
    key: 'shared_deliverables',
    label: 'Archivos Compartidos',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
}

export function getFolderLabel(key: string): string {
  return FOLDER_CONFIGS[key]?.label ?? key
}

export function getFolderBadgeClass(key: string): string {
  return (
    FOLDER_CONFIGS[key]?.badgeClass ??
    'border-border/60 bg-muted/20 text-muted-foreground'
  )
}
