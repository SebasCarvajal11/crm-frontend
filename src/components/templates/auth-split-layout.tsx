import type { ReactNode } from 'react'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { CimaLogo } from '@/components/ui/cima-logo'
import appTexture from '@/assets/backgrounds/app-texture.jpg'
import sidebarTexture from '@/assets/backgrounds/sidebar-texture.jpg'

type AuthSplitLayoutProps = {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  heroTitle?: string
  heroDescription?: string
  features?: string[]
  badgeText?: string
}

const DEFAULT_FEATURE_HIGHLIGHTS = [
  'Gestión 360° de Clientes y Oportunidades',
  'Espacios de Colaboración y Tableros Kanban',
  'Métricas y Rendimiento en Tiempo Real',
]

function HeroFeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-xs font-medium text-primary-foreground/90 sm:text-sm">
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-xs">
        <Sparkles className="size-3 text-white" />
      </div>
      <span>{text}</span>
    </div>
  )
}

function HeroBrandPanel({
  heroTitle = 'Centro de Innovación Multimedia y Artística',
  heroDescription = 'Plataforma centralizada para la aceleración comercial, gestión operativa y colaboración ágil.',
  features = DEFAULT_FEATURE_HIGHLIGHTS,
  badgeText = 'Acceso empresarial seguro y encriptado',
}: {
  heroTitle?: string
  heroDescription?: string
  features?: string[]
  badgeText?: string
}) {
  return (
    <aside
      className="relative flex flex-col justify-between overflow-hidden bg-primary bg-cover bg-center p-5 text-primary-foreground sm:p-8 lg:col-span-5 lg:p-10"
      style={{ backgroundImage: `url(${sidebarTexture})` }}
      aria-label="Presentación CIMA"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-[#4d0407]/90 backdrop-blur-[1px]" />

      <div className="relative z-10 space-y-4 sm:space-y-6">
        <CimaLogo size={36} inverted subtitle />
        <div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
            {heroTitle}
          </h2>
          <p className="text-xs leading-relaxed text-primary-foreground/80 sm:text-sm">
            {heroDescription}
          </p>
        </div>
        <div className="hidden space-y-2.5 pt-2 sm:block">
          {features.map((feature) => (
            <HeroFeatureItem key={feature} text={feature} />
          ))}
        </div>
      </div>

      <div className="relative z-10 hidden pt-6 sm:flex items-center gap-2 text-xs text-primary-foreground/75 border-t border-white/10">
        <ShieldCheck className="size-4 shrink-0 text-white/90" />
        <span>{badgeText}</span>
      </div>
    </aside>
  )
}

export function AuthSplitLayout({
  title,
  description,
  children,
  footer,
  heroTitle,
  heroDescription,
  features,
  badgeText,
}: AuthSplitLayoutProps) {
  return (
    <main
      className="relative flex min-h-[100dvh] items-center justify-center bg-background bg-cover bg-center bg-fixed p-4 sm:p-6 lg:p-10"
      style={{ backgroundImage: `url(${appTexture})` }}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xs grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        <HeroBrandPanel
          heroTitle={heroTitle}
          heroDescription={heroDescription}
          features={features}
          badgeText={badgeText}
        />
        <section className="flex flex-col justify-between p-5 sm:p-8 md:p-10 lg:col-span-7">
          <div className="mx-auto w-full max-w-md space-y-5 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2 text-left">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {description ? (
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
              ) : null}
            </div>

            <div className="space-y-4">{children}</div>
          </div>

          {footer ? (
            <footer className="mt-6 sm:mt-8 text-center text-xs text-muted-foreground">{footer}</footer>
          ) : null}
        </section>
      </div>
    </main>
  )
}
