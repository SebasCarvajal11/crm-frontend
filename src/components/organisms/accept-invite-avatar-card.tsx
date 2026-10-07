import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CIMA_CORPORATE_COLORS, getAvatarImageUrl, getAvatarSrcSet } from '@/shared/lib/avatar-catalog'

interface AcceptInviteAvatarCardProps {
  avatarId: number
  color: string
  onCustomize: () => void
}

export function AcceptInviteAvatarCard({
  avatarId,
  color,
  onCustomize,
}: AcceptInviteAvatarCardProps) {
  const colorOption =
    CIMA_CORPORATE_COLORS.find((c) => c.hex.toLowerCase() === color.toLowerCase()) ??
    CIMA_CORPORATE_COLORS[0]

  return (
    <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Tu avatar oficial CIMA</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={onCustomize}
          className="text-xs rounded-lg h-7 px-2.5"
        >
          Personalizar
        </Button>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={onCustomize}
        onKeyDown={(e) => e.key === 'Enter' && onCustomize()}
        className="flex items-center gap-3 p-2 rounded-lg bg-card/90 border border-border/60 cursor-pointer hover:border-primary/50 transition-colors"
      >
        <div
          className="size-12 rounded-full border-2 border-card shadow-sm overflow-hidden shrink-0 transition-colors"
          style={{ backgroundColor: color }}
        >
          <img
            src={getAvatarImageUrl(avatarId)}
            srcSet={getAvatarSrcSet(avatarId)}
            sizes="48px"
            alt={`Avatar #${avatarId}`}
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0 text-left">
          <p className="text-xs font-semibold text-foreground">Avatar #{avatarId + 1}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            Fondo: <span className="font-medium text-foreground">{colorOption.name}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
