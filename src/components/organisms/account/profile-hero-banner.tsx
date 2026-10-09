import { cn } from '@/shared/lib/utils'

interface ProfileHeroBannerProps {
  className?: string
}

/**
 * Banner de marca CIMA con degradado ejecutivo y malla fluida de orbes atmosféricos.
 * Acelerado por hardware (GPU compositor) y compatible con WCAG y prefers-reduced-motion.
 */
export function ProfileHeroBanner({ className }: ProfileHeroBannerProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="profile-hero-banner"
      className={cn(
        'relative h-28 w-full select-none overflow-hidden sm:h-32',
        'bg-gradient-to-r from-primary via-primary/95 to-primary/80',
        className,
      )}
    >
      {/* Luz cenital radial suave para relieve y sensación de profundidad */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          'bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_70%)]',
        )}
      />

      {/* Orbe 1: Resplandor carmesí cálido CIMA (cima-red-600) en sector superior derecho */}
      <div
        className={cn(
          'pointer-events-none absolute -top-12 -right-8 size-56 sm:size-64',
          'rounded-full bg-[radial-gradient(circle,rgba(189,47,53,0.7)_0%,rgba(189,47,53,0)_70%)]',
          'blur-2xl animate-aurora-orb-1',
        )}
      />

      {/* Orbe 2: Profundidad aterciopelada CIMA (cima-red-900) en sector inferior izquierdo */}
      <div
        className={cn(
          'pointer-events-none absolute -bottom-16 left-1/4 size-60 sm:size-72',
          'rounded-full bg-[radial-gradient(circle,rgba(104,6,9,0.75)_0%,rgba(104,6,9,0)_70%)]',
          'blur-3xl animate-aurora-orb-2',
        )}
      />

      {/* Orbe 3: Brillo tenue de luz flotante en la zona central/derecha */}
      <div
        className={cn(
          'pointer-events-none absolute top-1/4 right-1/3 size-44 sm:size-52',
          'rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,rgba(243,217,218,0.05)_50%,transparent_70%)]',
          'blur-2xl animate-aurora-orb-3',
        )}
      />

      {/* Viñeta perimetral inferior sutil para transición visual hacia la tarjeta */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/10 to-transparent" />
    </div>
  )
}
