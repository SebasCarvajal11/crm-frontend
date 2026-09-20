export const ACCENT_STYLES = {
  blue: { bar: 'bg-blue-500', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
  green: { bar: 'bg-green-500', iconBg: 'bg-green-100', iconText: 'text-green-600' },
  purple: { bar: 'bg-purple-500', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
  red: { bar: 'bg-red-500', iconBg: 'bg-red-100', iconText: 'text-red-600' },
  cyan: { bar: 'bg-cyan-500', iconBg: 'bg-cyan-100', iconText: 'text-cyan-600' },
  indigo: { bar: 'bg-indigo-500', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
} as const

export type Accent = keyof typeof ACCENT_STYLES
