import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/shared/lib/utils'
import {
  AVATARS_CATALOG,
  AVATAR_CATEGORY_TABS,
  CIMA_CORPORATE_COLORS,
  getAvatarImageUrl,
  type AvatarCategory,
} from '@/shared/lib/avatar-catalog'

interface AvatarPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialAvatarId?: number
  initialColor?: string
  isSaving: boolean
  onSave: (selection: { avatarId: number; color: string }) => Promise<void>
}

export function AvatarPickerDialog({
  open,
  onOpenChange,
  initialAvatarId = 0,
  initialColor = CIMA_CORPORATE_COLORS[0].hex,
  isSaving,
  onSave,
}: AvatarPickerDialogProps) {
  const [selectedAvatarId, setSelectedAvatarId] = useState<number>(initialAvatarId)
  const [selectedColor, setSelectedColor] = useState<string>(initialColor)
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>('todos')

  useEffect(() => {
    if (open) {
      setSelectedAvatarId(initialAvatarId)
      setSelectedColor(initialColor)
    }
  }, [open, initialAvatarId, initialColor])

  const filteredAvatars = useMemo(() => {
    if (activeCategory === 'todos') return AVATARS_CATALOG
    return AVATARS_CATALOG.filter((item) => item.categories.includes(activeCategory))
  }, [activeCategory])

  const selectedColorOption = useMemo(() => {
    return (
      CIMA_CORPORATE_COLORS.find((c) => c.hex.toLowerCase() === selectedColor.toLowerCase()) ??
      CIMA_CORPORATE_COLORS[0]
    )
  }, [selectedColor])

  const handleSave = async () => {
    await onSave({ avatarId: selectedAvatarId, color: selectedColor })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-3xl">
        <DialogHeader>
          <DialogMedia variant="default">
            <Sparkles className="size-5 text-primary" />
          </DialogMedia>
          <div className="flex flex-col gap-1 text-left min-w-0">
            <DialogTitle>Catálogo de Avatares CIMA</DialogTitle>
            <DialogDescription>
              Selecciona tu avatar oficial y personaliza el fondo con la paleta corporativa.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4 py-2">
          {/* Previsualización en vivo & Selector de color */}
          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-border/80 bg-muted/30 p-3 sm:p-4">
            <div className="relative shrink-0">
              <div
                className="size-24 sm:size-28 rounded-full border-4 border-card shadow-lg overflow-hidden transition-colors duration-200"
                style={{ backgroundColor: selectedColor }}
              >
                <img
                  src={getAvatarImageUrl(selectedAvatarId)}
                  alt="Avatar seleccionado"
                  className="size-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 w-full space-y-2 text-center sm:text-left">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Previsualización en vivo
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Fondo corporativo: <span className="font-medium text-foreground">{selectedColorOption.name}</span>
                </p>
              </div>

              {/* Swatches de colores */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {CIMA_CORPORATE_COLORS.map((color) => {
                  const isColorActive = selectedColor.toLowerCase() === color.hex.toLowerCase()
                  return (
                    <button
                      key={color.id}
                      type="button"
                      aria-label={color.name}
                      title={color.name}
                      onClick={() => setSelectedColor(color.hex)}
                      className={cn(
                        'size-6 sm:size-7 rounded-full transition-transform flex items-center justify-center shadow-xs',
                        'hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isColorActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
                      )}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isColorActive && <Check className="size-3 text-white drop-shadow-xs" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Categorías y Filtros rápidos */}
          <div className="flex items-center gap-1.5 border-b border-border/60 pb-2 overflow-x-auto no-scrollbar">
            {AVATAR_CATEGORY_TABS.map((tab) => {
              const isTabActive = activeCategory === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-all whitespace-nowrap',
                    isTabActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
            <span className="ml-auto text-[11px] text-muted-foreground shrink-0 pl-2">
              {filteredAvatars.length} disponibles
            </span>
          </div>

          {/* Grid de avatares con scroll optimizado */}
          <div className="max-h-[300px] sm:max-h-[340px] overflow-y-auto pr-1">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {filteredAvatars.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.id
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    aria-label={`Seleccionar avatar #${avatar.id}`}
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={cn(
                      'group relative aspect-square rounded-xl border p-1 transition-all overflow-hidden',
                      'hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      isSelected
                        ? 'border-primary ring-2 ring-primary bg-primary/10 shadow-sm'
                        : 'border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40'
                    )}
                  >
                    <div
                      className="size-full rounded-lg overflow-hidden flex items-center justify-center transition-colors"
                      style={{ backgroundColor: isSelected ? selectedColor : 'transparent' }}
                    >
                      <img
                        src={getAvatarImageUrl(avatar.id)}
                        alt={`Avatar ${avatar.id}`}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    </div>
                    {isSelected && (
                      <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                        <Check className="size-2.5" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="rounded-xl text-xs"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="rounded-xl text-xs font-medium shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                Guardando avatar...
              </>
            ) : (
              'Guardar avatar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
