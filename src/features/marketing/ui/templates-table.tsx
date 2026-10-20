import { Archive, Eye, FileText, Pencil, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/shared/lib/utils'
import type { MessageTemplate } from '../api/templates-api'
import { channelLabel } from './templates.utils'

interface TemplatesTableProps {
  templates: MessageTemplate[]
  /** Hay plantillas, pero ninguna coincide con el filtro. */
  filtered?: boolean
  isBusy?: boolean
  onCreate: () => void
  onClearFilters: () => void
  onEdit: (template: MessageTemplate) => void
  onPreview: (template: MessageTemplate) => void
  onToggleActive: (template: MessageTemplate) => void
}

/** Lista de plantillas de mensajes (pestaña Plantillas). */
export function TemplatesTable({
  templates,
  filtered,
  isBusy,
  onCreate,
  onClearFilters,
  onEdit,
  onPreview,
  onToggleActive,
}: TemplatesTableProps) {
  if (templates.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-14 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          {filtered ? (
            <>
              <p className="font-medium">Ninguna plantilla coincide con el filtro</p>
              <Button variant="outline" className="mt-4" onClick={onClearFilters}>
                Ver todas
              </Button>
            </>
          ) : (
            <>
              <p className="font-medium">Aún no hay plantillas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Escriba una vez los mensajes que más usa y reutilícelos en automatizaciones y WhatsApp.
              </p>
              <Button className="mt-4" onClick={onCreate}>
                Nueva plantilla
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto scroll-smooth scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Plantilla</th>
                <th className="px-4 py-3 font-semibold">Canal</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr
                  key={t.templateId}
                  className={cn(
                    'border-b last:border-0 transition-colors duration-150 hover:bg-muted/30',
                    !t.active && 'text-muted-foreground'
                  )}
                >
                  <td className="max-w-sm px-4 py-3">
                    <p className="font-medium">{t.name}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground" title={t.body}>
                      {t.channel === 'EMAIL' && t.subject ? `${t.subject} · ` : ''}
                      {t.body}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">{channelLabel(t.channel)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">{t.plan || 'Todos'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                        t.active
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-border bg-muted text-muted-foreground'
                      )}
                    >
                      {t.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => onPreview(t)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Vista previa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        disabled={isBusy}
                        onClick={() => onEdit(t)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        disabled={isBusy}
                        onClick={() => onToggleActive(t)}
                      >
                        {t.active ? (
                          <>
                            <Archive className="h-3.5 w-3.5" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-3.5 w-3.5" />
                            Activar
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
