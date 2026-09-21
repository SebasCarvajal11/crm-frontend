import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CimaLogo } from '@/components/ui/cima-logo'
import { BRAND_TEXTURES, useTextureLoaded } from '@/shared/lib/brand-textures'

type AuthCardLayoutProps = {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

/** Plantilla centrada para flujos públicos de auth (plantilla). */
export function AuthCardLayout({
  title,
  description,
  children,
  footer,
}: AuthCardLayoutProps) {
  const isAppLoaded = useTextureLoaded(BRAND_TEXTURES.app)

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-background px-4 py-8 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-fixed transition-opacity duration-300 ease-out"
        style={{
          backgroundImage: `url(${BRAND_TEXTURES.app})`,
          opacity: isAppLoaded ? 1 : 0,
        }}
      />
      <div className="relative z-10 w-full max-w-md">
        <CimaLogo className="mb-5 justify-center" size={34} textColor="text-foreground" subtitle />
        <Card className="w-full border-border/80 bg-card/95 backdrop-blur-xs shadow-lg">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="space-y-5">{children}</CardContent>
        </Card>
      </div>
      {footer ? (
        <p className="text-center text-sm text-muted-foreground">{footer}</p>
      ) : null}
    </div>
  )
}
