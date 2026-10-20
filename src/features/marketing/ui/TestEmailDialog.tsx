import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, MailCheck, Send, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { parseApiError } from '@/shared/lib'
import { cn } from '@/shared/lib/utils'
import { sendTestEmailRequest, type TestEmailResult } from '../api/notifications-api'
import { testEmailResultLabel } from './delivery.utils'
import { isValidEmail } from './email-quota.utils'

interface TestEmailDialogProps {
  accessToken: string
}

/** Botón y diálogo "Enviar correo de prueba" (solo admin). */
export function TestEmailDialog({ accessToken }: TestEmailDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [to, setTo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TestEmailResult | null>(null)

  const mutation = useMutation({
    mutationFn: (destinatario: string) => sendTestEmailRequest(accessToken, destinatario),
    onSuccess: (data) => {
      setResult(data)
      void queryClient.invalidateQueries({ queryKey: ['marketing', 'email-quota'] })
    },
    onError: async (err) => setError(await parseApiError(err)),
  })

  function cerrar() {
    setOpen(false)
    setTo('')
    setError(null)
    setResult(null)
    mutation.reset()
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    if (!isValidEmail(to)) {
      setError('Escriba un correo válido, por ejemplo nombre@empresa.com.')
      return
    }
    mutation.mutate(to.trim())
  }

  const resumen = result ? testEmailResultLabel(result.deliveryStatus) : null

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 rounded-lg font-semibold shadow-2xs"
        onClick={() => setOpen(true)}
        data-tour="marketing-test-email-btn"
      >
        <MailCheck className="size-4" />
        Enviar correo de prueba
      </Button>

      <Dialog open={open} onOpenChange={(v) => !v && cerrar()}>
        <DialogContent size="md">
          <form onSubmit={enviar} className="flex min-h-0 flex-1 flex-col" noValidate>
            <DialogHeader>
              <DialogMedia variant="info">
                <MailCheck className="size-5" />
              </DialogMedia>
              <div className="flex min-w-0 flex-col gap-1 text-left">
                <DialogTitle>Enviar correo de prueba</DialogTitle>
                <DialogDescription>
                  Envía la plantilla de correo de CIMA a la dirección que indique, para revisar cómo llega.
                </DialogDescription>
              </div>
            </DialogHeader>
            <DialogBody className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="test-email-to" className="text-xs font-medium text-foreground/90">
                  Destinatario
                </Label>
                <Input
                  id="test-email-to"
                  type="email"
                  autoComplete="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="nombre@empresa.com"
                  className="h-9 rounded-xl border-border/70 text-xs"
                />
              </div>
              {error && <p className="text-xs font-medium text-destructive">{error}</p>}
              {result && resumen && (
                <div
                  role="status"
                  className={cn(
                    'flex items-start gap-2 rounded-lg border p-3 text-xs',
                    resumen.ok
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-destructive/40 bg-destructive/10'
                  )}
                >
                  {resumen.ok ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  )}
                  <div className="space-y-0.5">
                    <p className="font-semibold">{resumen.label}</p>
                    {result.detail && <p className="text-muted-foreground">{result.detail}</p>}
                  </div>
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" className="rounded-xl text-xs" onClick={cerrar}>
                Cerrar
              </Button>
              <Button type="submit" size="sm" disabled={mutation.isPending} className="gap-1.5 rounded-xl text-xs">
                <Send className="size-3.5" />
                {mutation.isPending ? 'Enviando…' : 'Enviar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
