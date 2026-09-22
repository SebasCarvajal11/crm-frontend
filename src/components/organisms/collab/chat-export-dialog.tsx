import { useState } from 'react'
import { Download, ShieldCheck, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  fetchAllExportMessages,
  buildExportPayload,
  buildWhatsAppForensicTranscript,
  buildAuditJsonTranscript,
  triggerFileDownload,
} from '@/features/collab/utils/chat-export.utils'
import type { ChatExportChannel, ChatExportFormat } from '@/features/collab/utils/chat-export.types'
import type { ProjectMember } from '@/features/collab/model'
import type { MeResponse } from '@/shared/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  accessToken: string
  projectId: string
  projectName?: string
  currentChannel: 'external' | 'internal'
  members: ProjectMember[]
  identity: MeResponse['data']
  onError: (msg: string) => void
}

export function ChatExportDialog({
  open,
  onOpenChange,
  accessToken,
  projectId,
  projectName = 'Proyecto',
  currentChannel,
  members,
  identity,
  onError,
}: Props) {
  const [selectedChannel, setSelectedChannel] = useState<ChatExportChannel>(currentChannel)
  const [format, setFormat] = useState<ChatExportFormat>('txt')
  const [custodyAgreed, setCustodyAgreed] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [lastGeneratedHash, setLastGeneratedHash] = useState<string | null>(null)

  const handleExport = async () => {
    if (!custodyAgreed || isExporting) return
    setIsExporting(true)
    try {
      const messages = await fetchAllExportMessages(accessToken, projectId, selectedChannel)
      const payload = buildExportPayload(
        { projectId, projectName, channel: selectedChannel, format, members, issuer: identity },
        messages
      )

      let fileContent = ''
      let fileExtension = 'txt'
      let mimeType = 'text/plain'
      let hash = ''

      if (format === 'txt') {
        const result = await buildWhatsAppForensicTranscript(payload, members)
        fileContent = result.content
        hash = result.hash
      } else {
        const result = await buildAuditJsonTranscript(payload)
        fileContent = result.content
        fileExtension = 'json'
        mimeType = 'application/json'
        hash = result.hash
      }

      setLastGeneratedHash(hash)
      const sanitizedName = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 30)
      const dateTag = new Date().toISOString().slice(0, 10)
      const filename = `conversacion-${sanitizedName}-${selectedChannel}-${dateTag}.${fileExtension}`

      triggerFileDownload(filename, fileContent, mimeType)
    } catch (err) {
      console.error('[ChatExportDialog] Error al generar exportación probatoria:', err)
      onError('Ocurrió un error al generar la exportación probatoria de la conversación.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 ring-1 ring-primary/20">
              <ShieldCheck className="size-5" />
            </div>
            <div className="space-y-0.5 min-w-0 pr-8">
              <DialogTitle className="text-base font-semibold text-foreground">
                Registro Probatorio de Conversación
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Exportación oficial certificada bajo estándares de mensajes de datos y trazabilidad forense.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4 sm:px-6 text-sm">
          <div className="rounded-xl border border-border/80 bg-muted/25 p-3.5 space-y-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 border-b border-border/40">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground block">Proyecto</span>
                <span className="font-semibold text-foreground text-xs break-words block">{projectName}</span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground block">Custodio Emisor</span>
                <span className="font-semibold text-foreground text-xs break-words block">
                  {identity.first_name ?? ''} {identity.last_name ?? ''}
                  <span className="text-muted-foreground font-normal ml-1">({identity.role})</span>
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-muted-foreground pt-0.5">
              <span>Marco legal y forense:</span>
              <span className="font-medium text-foreground bg-background/80 px-2 py-0.5 rounded border border-border/60">
                Ley 527/1999 • ISO/IEC 27037
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-channel" className="text-xs font-medium text-foreground">Canal a exportar</Label>
            <Select
              value={selectedChannel}
              onValueChange={(val) => setSelectedChannel(val as ChatExportChannel)}
            >
              <SelectTrigger id="export-channel" className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="external">Canal con el Cliente (Externo)</SelectItem>
                <SelectItem value="internal">Canal del Equipo (Interno)</SelectItem>
                <SelectItem value="both">Ambos Canales (Histórico Completo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-format" className="text-xs font-medium text-foreground">Formato de salida</Label>
            <Select
              value={format}
              onValueChange={(val) => setFormat(val as ChatExportFormat)}
            >
              <SelectTrigger id="export-format" className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="txt">
                  Texto Forense Estándar (.txt estilo WhatsApp con certificación)
                </SelectItem>
                <SelectItem value="json">
                  Reporte Estructurado de Auditoría (.json con firmas y lecturas)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 flex items-start gap-3">
            <Checkbox
              id="custody-agreement"
              checked={custodyAgreed}
              onCheckedChange={(checked) => setCustodyAgreed(Boolean(checked))}
              className="mt-0.5 shrink-0"
            />
            <Label
              htmlFor="custody-agreement"
              className="text-xs leading-relaxed text-muted-foreground cursor-pointer font-normal"
            >
              Certifico bajo mi rol de Administrador que esta exportación se emite con fines
              legítimos de respaldo contractual o auditoría probatoria, asegurando la debida custodia.
            </Label>
          </div>

          {lastGeneratedHash && (
            <div className="rounded-xl border bg-muted/40 p-3 space-y-1">
              <p className="text-[11px] font-semibold text-foreground">Sello Criptográfico Generado (SHA-256):</p>
              <p className="font-mono text-[10px] break-all text-muted-foreground">{lastGeneratedHash}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
            className="w-full sm:w-auto text-xs"
          >
            Cerrar
          </Button>
          <Button
            type="button"
            size="default"
            onClick={handleExport}
            disabled={!custodyAgreed || isExporting}
            className="w-full sm:w-auto gap-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isExporting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generando registro...
              </>
            ) : (
              <>
                <Download className="size-4" />
                Descargar Registro Probatorio
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
