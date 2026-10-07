import basicLogo from '@/assets/brand/cima-basic.png'
import fullLogo from '@/assets/brand/cima-full.png'
import emblemLogo from '@/assets/brand/cima-emblem.png'
import cimaxisLogo from '@/assets/brand/cimaxis.png'
import { cn } from '@/shared/lib/utils'

const logos = {
  basic: { src: basicLogo, alt: 'CIMA', width: 651, height: 225, displayWidth: 150 },
  full: {
    src: fullLogo,
    alt: 'CIMA — Centro de Innovación Multimedia y Artística',
    width: 483,
    height: 237,
    displayWidth: 220,
  },
  emblem: { src: emblemLogo, alt: 'CIMA', width: 276, height: 287, displayWidth: 32 },
  cimaxis: { src: cimaxisLogo, alt: 'CIMAxis', width: 1149, height: 217, displayWidth: 208 },
} as const

type CimaLogoProps = {
  variant?: keyof typeof logos
  width?: number
  className?: string
  /** Negativo monocromático sobre fondos oscuros; adaptación al tema por defecto. */
  tone?: 'adaptive' | 'inverse'
}

export function CimaLogo({ variant = 'basic', width, className, tone = 'adaptive' }: CimaLogoProps) {
  const logo = logos[variant]

  return (
    <span
      className={cn(
        'inline-flex max-w-full min-w-0 items-center justify-center align-middle',
        className,
      )}
    >
      <img
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className={cn(
          'block h-auto max-w-full object-contain',
          tone === 'inverse' ? 'brightness-0 invert' : 'dark:brightness-0 dark:invert',
        )}
        style={{ width: width ?? logo.displayWidth }}
        decoding="async"
        draggable={false}
      />
    </span>
  )
}
