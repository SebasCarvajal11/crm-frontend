export const ACCENT_STYLES = {
  blue: {
    bar: 'bg-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-950/60',
    iconText: 'text-blue-700 dark:text-blue-300',
  },
  green: {
    bar: 'bg-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    iconText: 'text-emerald-700 dark:text-emerald-300',
  },
  purple: {
    bar: 'bg-purple-500',
    iconBg: 'bg-purple-100 dark:bg-purple-950/60',
    iconText: 'text-purple-700 dark:text-purple-300',
  },
  red: {
    bar: 'bg-primary',
    iconBg: 'bg-primary/10 dark:bg-primary/20',
    iconText: 'text-primary dark:text-primary',
  },
  cyan: {
    bar: 'bg-cyan-500',
    iconBg: 'bg-cyan-100 dark:bg-cyan-950/60',
    iconText: 'text-cyan-700 dark:text-cyan-300',
  },
  indigo: {
    bar: 'bg-indigo-500',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/60',
    iconText: 'text-indigo-700 dark:text-indigo-300',
  },
} as const

export type Accent = keyof typeof ACCENT_STYLES
