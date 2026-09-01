import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CimaLogo } from '@/components/ui/cima-logo'

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
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-muted/40 px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        <CimaLogo className="mb-5 justify-center" size={34} textColor="text-foreground" subtitle />
        <Card className="w-full border-border/80 shadow-md">
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
