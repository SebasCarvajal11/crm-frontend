import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/utils'
import { CIMA_ICONS_DATA, type CimaIconDefinition } from './cima-icon-data'

export type CimaIconName = keyof typeof CIMA_ICONS_DATA

export type CimaIconSize = 'micro' | 'sm' | 'md' | 'lg' | 'xl' | number | string
export type CimaIconVariant = 'default' | 'accent' | 'badge' | 'subtle' | 'glow'

export interface CimaIconProps extends React.SVGProps<SVGSVGElement> {
  name?: string
  size?: CimaIconSize
  variant?: CimaIconVariant
  animated?: boolean
  className?: string
  strokeWidth?: number | string
  color?: string
}

const SIZE_PRESETS: Record<string, number> = {
  micro: 14,
  sm: 16,
  md: 18,
  lg: 22,
  xl: 28,
}

function resolveSize(size?: CimaIconSize): { width?: number | string; height?: number | string } {
  if (!size) return {}
  if (typeof size === 'number') {
    return { width: size, height: size }
  }
  if (typeof size === 'string' && SIZE_PRESETS[size]) {
    const px = SIZE_PRESETS[size]
    return { width: px, height: px }
  }
  return { width: size, height: size }
}

/**
 * Componente Canónico de Iconografía CIMA CRM.
 * Reemplaza los iconos genéricos estáticos con una presentación elevada,
 * animaciones vectoriales nativas e interacciones acordes a la identidad CIMA.
 */
export const CimaIcon = forwardRef<SVGSVGElement, CimaIconProps>(function CimaIcon(
  {
    name,
    size,
    variant = 'default',
    animated = true,
    className,
    strokeWidth,
    color,
    style,
    ...props
  },
  ref,
) {
  const iconDef: CimaIconDefinition | undefined = name ? CIMA_ICONS_DATA[name] : undefined
  const dim = resolveSize(size)
  const kebab = name ? name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase() : 'icon'

  // Variantes de presentación artesanal de CIMA
  const variantClasses = {
    default: '',
    accent: 'text-[var(--primary,#86070c)] hover:text-[var(--primary-hover,#a8131a)]',
    subtle: 'text-neutral-text-muted hover:text-[var(--primary,#86070c)]',
    glow: 'text-[var(--primary,#86070c)] drop-shadow-[0_0_6px_rgba(134,7,12,0.35)]',
    badge: 'p-1 rounded-lg bg-[var(--primary,#86070c)]/5 border border-[var(--primary,#86070c)]/15 text-[var(--primary,#86070c)] hover:bg-[var(--primary,#86070c)]/10 hover:border-[var(--primary,#86070c)]/25',
  }[variant]

  const { children, ...restProps } = props

  const svgProps = {
    ref,
    viewBox: iconDef ? `0 0 ${iconDef.width} ${iconDef.height}` : '0 0 24 24',
    width: dim.width ?? '1em',
    height: dim.height ?? '1em',
    fill: 'currentColor',
    stroke: iconDef?.body?.includes('stroke="currentColor"') ? 'currentColor' : undefined,
    strokeWidth,
    className: cn(
      'cima-icon inline-block shrink-0 align-middle',
      `lucide lucide-${kebab}`,
      animated && 'transition-all duration-200 ease-out hover:scale-[1.07] active:scale-[0.94]',
      variantClasses,
      className,
    ),
    style: {
      color: color ?? undefined,
      ...style,
    },
    'aria-hidden': restProps['aria-label'] ? undefined : true,
    ...restProps,
  }

  const svgElement = iconDef ? (
    <svg {...svgProps} dangerouslySetInnerHTML={{ __html: iconDef.body }} />
  ) : (
    <svg {...svgProps}>
      {children ?? (
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      )}
    </svg>
  )

  if (variant === 'badge') {
    return (
      <span className="inline-flex shrink-0 items-center justify-center p-0.5 align-middle">
        {svgElement}
      </span>
    )
  }

  return svgElement
})

CimaIcon.displayName = 'CimaIcon'

// Fábrica de componentes individuales compatibles con firmas de Lucide
export type LucideIcon = React.ForwardRefExoticComponent<
  CimaIconProps & React.RefAttributes<SVGSVGElement>
>
export type LucideProps = CimaIconProps

function createIcon(iconName: string): LucideIcon {
  const Comp = forwardRef<SVGSVGElement, CimaIconProps>((props, ref) => (
    <CimaIcon ref={ref} name={iconName} {...props} />
  ))
  Comp.displayName = iconName
  return Comp as LucideIcon
}

// Exportación individual de los 136 componentes de icono para paridad transparente
export const Activity: LucideIcon = createIcon('Activity');
export const AlertCircle: LucideIcon = createIcon('AlertCircle');
export const AlertOctagon: LucideIcon = createIcon('AlertOctagon');
export const AlertTriangle: LucideIcon = createIcon('AlertTriangle');
export const Archive: LucideIcon = createIcon('Archive');
export const ArrowLeft: LucideIcon = createIcon('ArrowLeft');
export const ArrowRight: LucideIcon = createIcon('ArrowRight');
export const Award: LucideIcon = createIcon('Award');
export const BadgeDollarSign: LucideIcon = createIcon('BadgeDollarSign');
export const BarChart3: LucideIcon = createIcon('BarChart3');
export const Bell: LucideIcon = createIcon('Bell');
export const Bot: LucideIcon = createIcon('Bot');
export const Briefcase: LucideIcon = createIcon('Briefcase');
export const BriefcaseBusiness: LucideIcon = createIcon('BriefcaseBusiness');
export const Building2: LucideIcon = createIcon('Building2');
export const Calendar: LucideIcon = createIcon('Calendar');
export const CalendarClock: LucideIcon = createIcon('CalendarClock');
export const CalendarRange: LucideIcon = createIcon('CalendarRange');
export const Camera: LucideIcon = createIcon('Camera');
export const ChartAreaIcon: LucideIcon = createIcon('ChartAreaIcon');
export const Check: LucideIcon = createIcon('Check');
export const CheckCheck: LucideIcon = createIcon('CheckCheck');
export const CheckCircle: LucideIcon = createIcon('CheckCircle');
export const CheckCircle2: LucideIcon = createIcon('CheckCircle2');
export const CheckIcon: LucideIcon = createIcon('CheckIcon');
export const CheckSquare: LucideIcon = createIcon('CheckSquare');
export const CheckSquare2: LucideIcon = createIcon('CheckSquare2');
export const ChevronDownIcon: LucideIcon = createIcon('ChevronDownIcon');
export const ChevronLeft: LucideIcon = createIcon('ChevronLeft');
export const ChevronRight: LucideIcon = createIcon('ChevronRight');
export const ChevronRightIcon: LucideIcon = createIcon('ChevronRightIcon');
export const ChevronUp: LucideIcon = createIcon('ChevronUp');
export const ChevronUpIcon: LucideIcon = createIcon('ChevronUpIcon');
export const Clock: LucideIcon = createIcon('Clock');
export const Clock3: LucideIcon = createIcon('Clock3');
export const Cloud: LucideIcon = createIcon('Cloud');
export const Crown: LucideIcon = createIcon('Crown');
export const Database: LucideIcon = createIcon('Database');
export const Download: LucideIcon = createIcon('Download');
export const Copy: LucideIcon = createIcon('Copy');
export const Edit2: LucideIcon = createIcon('Edit2');
export const ExternalLink: LucideIcon = createIcon('ExternalLink');
export const Eye: LucideIcon = createIcon('Eye');
export const EyeOff: LucideIcon = createIcon('EyeOff');
export const File: LucideIcon = createIcon('File');
export const FileCheck: LucideIcon = createIcon('FileCheck');
export const FileCode: LucideIcon = createIcon('FileCode');
export const FileImage: LucideIcon = createIcon('FileImage');
export const FileSignature: LucideIcon = createIcon('FileSignature');
export const FileSpreadsheet: LucideIcon = createIcon('FileSpreadsheet');
export const FileText: LucideIcon = createIcon('FileText');
export const FileUp: LucideIcon = createIcon('FileUp');
export const FileVideo: LucideIcon = createIcon('FileVideo');
export const Filter: LucideIcon = createIcon('Filter');
export const FolderArchive: LucideIcon = createIcon('FolderArchive');
export const FolderCheck: LucideIcon = createIcon('FolderCheck');
export const FolderGit2: LucideIcon = createIcon('FolderGit2');
export const FolderKanban: LucideIcon = createIcon('FolderKanban');
export const FolderOpen: LucideIcon = createIcon('FolderOpen');
export const FolderSync: LucideIcon = createIcon('FolderSync');
export const FolderTree: LucideIcon = createIcon('FolderTree');
export const GalleryHorizontalEnd: LucideIcon = createIcon('GalleryHorizontalEnd');
export const Gem: LucideIcon = createIcon('Gem');
export const GitPullRequest: LucideIcon = createIcon('GitPullRequest');
export const GitPullRequestArrow: LucideIcon = createIcon('GitPullRequestArrow');
export const GitPullRequestClosed: LucideIcon = createIcon('GitPullRequestClosed');
export const Globe: LucideIcon = createIcon('Globe');
export const GripVertical: LucideIcon = createIcon('GripVertical');
export const Handshake: LucideIcon = createIcon('Handshake');
export const HardDrive: LucideIcon = createIcon('HardDrive');
export const HardHat: LucideIcon = createIcon('HardHat');
export const HelpCircle: LucideIcon = createIcon('HelpCircle');
export const History: LucideIcon = createIcon('History');
export const Image: LucideIcon = createIcon('Image');
export const KanbanSquare: LucideIcon = createIcon('KanbanSquare');
export const KeyRound: LucideIcon = createIcon('KeyRound');
export const LaptopMinimal: LucideIcon = createIcon('LaptopMinimal');
export const Layers: LucideIcon = createIcon('Layers');
export const Link2: LucideIcon = createIcon('Link2');
export const ListTodo: LucideIcon = createIcon('ListTodo');
export const Loader2: LucideIcon = createIcon('Loader2');
export const LocateFixed: LucideIcon = createIcon('LocateFixed');
export const Lock: LucideIcon = createIcon('Lock');
export const LogOut: LucideIcon = createIcon('LogOut');
export const Mail: LucideIcon = createIcon('Mail');
export const MailCheck: LucideIcon = createIcon('MailCheck');
export const MailWarning: LucideIcon = createIcon('MailWarning');
export const Megaphone: LucideIcon = createIcon('Megaphone');
export const Menu: LucideIcon = createIcon('Menu');
export const MessageSquare: LucideIcon = createIcon('MessageSquare');
export const MessageSquarePlus: LucideIcon = createIcon('MessageSquarePlus');
export const Minimize2: LucideIcon = createIcon('Minimize2');
export const MoreHorizontal: LucideIcon = createIcon('MoreHorizontal');
export const MoreVertical: LucideIcon = createIcon('MoreVertical');
export const PanelLeftClose: LucideIcon = createIcon('PanelLeftClose');
export const PanelLeftOpen: LucideIcon = createIcon('PanelLeftOpen');
export const Paperclip: LucideIcon = createIcon('Paperclip');
export const PenLine: LucideIcon = createIcon('PenLine');
export const Pencil: LucideIcon = createIcon('Pencil');
export const PhoneCall: LucideIcon = createIcon('PhoneCall');
export const Play: LucideIcon = createIcon('Play');
export const PlayCircle: LucideIcon = createIcon('PlayCircle');
export const Plus: LucideIcon = createIcon('Plus');
export const PlusCircle: LucideIcon = createIcon('PlusCircle');
export const RefreshCw: LucideIcon = createIcon('RefreshCw');
export const RotateCcw: LucideIcon = createIcon('RotateCcw');
export const Scale: LucideIcon = createIcon('Scale');
export const Search: LucideIcon = createIcon('Search');
export const Send: LucideIcon = createIcon('Send');
export const Share2: LucideIcon = createIcon('Share2');
export const Shield: LucideIcon = createIcon('Shield');
export const ShieldAlert: LucideIcon = createIcon('ShieldAlert');
export const ShieldCheck: LucideIcon = createIcon('ShieldCheck');
export const ShieldPlus: LucideIcon = createIcon('ShieldPlus');
export const Sparkles: LucideIcon = createIcon('Sparkles');
export const Table: LucideIcon = createIcon('Table');
export const Tag: LucideIcon = createIcon('Tag');
export const Target: LucideIcon = createIcon('Target');
export const Trash2: LucideIcon = createIcon('Trash2');
export const TrendingUp: LucideIcon = createIcon('TrendingUp');
export const Type: LucideIcon = createIcon('Type');
export const Upload: LucideIcon = createIcon('Upload');
export const User: LucideIcon = createIcon('User');
export const UserCheck: LucideIcon = createIcon('UserCheck');
export const UserCircle2: LucideIcon = createIcon('UserCircle2');
export const UserPlus: LucideIcon = createIcon('UserPlus');
export const UserRound: LucideIcon = createIcon('UserRound');
export const UserX: LucideIcon = createIcon('UserX');
export const Users: LucideIcon = createIcon('Users');
export const UsersRound: LucideIcon = createIcon('UsersRound');
export const WifiOff: LucideIcon = createIcon('WifiOff');
export const X: LucideIcon = createIcon('X');
export const XCircle: LucideIcon = createIcon('XCircle');
export const XIcon: LucideIcon = createIcon('XIcon');
export const Zap: LucideIcon = createIcon('Zap');
export const ZoomIn: LucideIcon = createIcon('ZoomIn');
export const ZoomOut: LucideIcon = createIcon('ZoomOut');
