import { Compass, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type HelpCenterHeaderProps = {
  tabName: string
  roleName: string
  onClose: () => void
}

export function HelpCenterHeader({ tabName, roleName, onClose }: HelpCenterHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
      <div className="flex items-center gap-3">
        <div
          className={[
            'flex size-9 items-center justify-center rounded-xl',
            'bg-primary/10 text-primary border border-primary/20',
          ].join(' ')}
        >
          <Compass className="size-5" />
        </div>
        <div>
          <h2 id="cima-help-title" className="text-sm sm:text-base font-bold text-foreground">
            CIMA Smart Copilot — Centro de Asistencia
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{tabName}</span>
            <span>•</span>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
              {roleName}
            </Badge>
          </div>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        aria-label="Cerrar centro de ayuda"
        className="rounded-full cursor-pointer hover:bg-muted"
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}
