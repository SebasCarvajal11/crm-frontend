import type { ReactNode } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, Eye, Loader2, Play, UserX, XCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/shared/lib/utils'
import type { Workflow, WorkflowPreview, WorkflowRunNowResult, WorkflowSkippedClient } from '../api/marketing-api'
import { clientCountLabel } from './audience.utils'
import { RUN_TONE_CLASSES, formatLocalDateTime, runNowWarning, runResultMeta, triggerUsesSchedule } from './workflow.utils'

function ListSection({
  title,
  count,
  icon,
  empty,
  testId,
  children,
}: {
  title: string
  count: number
  icon: ReactNode
  empty: string
  testId: string
  children: ReactNode
}) {
  return (
    <section className="space-y-2" data-testid={testId}>
      <h3 className="flex items-center gap-1.5 text-sm font-bold">
        {icon}
        {title}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">{count}</span>
      </h3>
      {count === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-3 text-center text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="max-h-60 divide-y overflow-y-auto rounded-lg border border-border/70">{children}</ul>
      )}
    </section>
  )
}

function SkippedList({ skipped, empty }: { skipped: WorkflowSkippedClient[]; empty: string }) {
  return (
    <ListSection
      title="No le llegará"
      count={skipped.length}
      icon={<UserX className="size-4 text-muted-foreground" />}
      empty={empty}
      testId="workflow-skipped"
    >
      {skipped.map((c) => (
        <li key={c.clientId} className="flex flex-col gap-0.5 px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <span className="font-medium">{c.name || c.clientId}</span>
          <span className="text-muted-foreground sm:text-right">{c.reason}</span>
        </li>
      ))}
    </ListSection>
  )
}

// ── Ver a quién le llegaría ─────────────────────────────────────────────────
export function WorkflowPreviewDialog({
  workflow,
  preview,
  isLoading,
  isError,
  onRetry,
  onClose,
  onRunNow,
}: {
  workflow: Workflow | null
  preview?: WorkflowPreview | null
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onClose: () => void
  onRunNow?: () => void
}) {
  return (
    <Dialog open={workflow !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogMedia variant="default">
            <Eye className="size-5" />
          </DialogMedia>
          <div className="flex min-w-0 flex-col gap-1 text-left">
            <DialogTitle>¿A quién le llegaría?</DialogTitle>
            <DialogDescription>
              {workflow?.workflowName}
              {preview ? ` · Campaña ${preview.campaignName} · audiencia de ${clientCountLabel(preview.audienceSize)}` : ''}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4" data-testid="workflow-preview">
          {isLoading ? (
            <div className="space-y-2" role="status" aria-label="Calculando a quién le llegaría">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          ) : isError || !preview ? (
            <div className="py-6 text-center">
              <XCircle className="mx-auto mb-2 size-8 text-destructive" />
              <p className="text-sm font-medium">No se pudo calcular la vista previa</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
                Reintentar
              </Button>
            </div>
          ) : (
            <WorkflowPreviewContent preview={preview} triggerType={workflow?.triggerType ?? ''} />
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          {onRunNow && preview && preview.eligible.length > 0 && (
            <Button size="sm" className="gap-1.5" onClick={onRunNow}>
              <Play className="size-3.5 fill-current" />
              Ejecutar ahora
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Confirmar "Ejecutar ahora" ───────────────────────────────────────────────
export function RunNowConfirmDialog({
  workflow,
  isPending,
  onConfirm,
  onCancel,
}: {
  workflow: Workflow | null
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const manual = workflow?.triggerType === 'manual'
  return (
    <AlertDialog open={workflow !== null} onOpenChange={(o) => !o && !isPending && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Ejecutar “{workflow?.workflowName}” ahora?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm">
              <p
                className={cn(
                  manual &&
                    'rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-medium text-amber-800 dark:text-amber-300'
                )}
                data-testid="run-now-warning"
              >
                {workflow ? runNowWarning(workflow.triggerType) : ''}
              </p>
              <p>Al terminar verá el resultado de cada cliente.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isPending}
            className="gap-1.5"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-3.5 fill-current" />}
            Sí, ejecutar ahora
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ── Resultado de "Ejecutar ahora" ────────────────────────────────────────────
export function RunNowResultDialog({
  workflow,
  result,
  onClose,
}: {
  workflow: Workflow | null
  result: WorkflowRunNowResult | null
  onClose: () => void
}) {
  const executed = result?.executed ?? []
  const skipped = result?.skipped ?? []
  return (
    <Dialog open={workflow !== null && result !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogMedia variant="success">
            <CheckCircle2 className="size-5" />
          </DialogMedia>
          <div className="flex min-w-0 flex-col gap-1 text-left">
            <DialogTitle>Resultado de la ejecución</DialogTitle>
            <DialogDescription>
              {workflow?.workflowName} · {clientCountLabel(executed.length)} con acción, {skipped.length} omitidos
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4" data-testid="run-now-result">
          <RunNowResultContent result={result} actionType={workflow?.actionType ?? ''} />
        </DialogBody>
        <DialogFooter>
          <Button size="sm" onClick={onClose}>
            Listo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Listas "Le llegará" y "No le llegará" (exportado para probarlo sin el diálogo). */
export function WorkflowPreviewContent({ preview, triggerType }: { preview: WorkflowPreview; triggerType: string }) {
  return (
    <>
      {!preview.campaignActive && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300" role="status">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          La campaña no está activa o está fuera de sus fechas: hoy no le llegaría a nadie.
        </p>
      )}
      {triggerUsesSchedule(triggerType) && (
        <p className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs" data-testid="workflow-next-run">
          <CalendarClock className="size-4 text-primary" />
          {preview.nextRunAt
            ? `Se enviará el ${formatLocalDateTime(preview.nextRunAt)}.`
            : 'No tiene una próxima fecha de envío.'}
        </p>
      )}
      <ListSection
        title="Le llegará"
        count={preview.eligible.length}
        icon={<CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />}
        empty="Hoy no le llegaría a ningún cliente."
        testId="workflow-eligible"
      >
        {preview.eligible.map((c) => (
          <li key={c.clientId} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
            <span className="font-medium">{c.name || c.clientId}</span>
            {c.plan && <span className="text-muted-foreground">Plan {c.plan}</span>}
          </li>
        ))}
      </ListSection>
      <SkippedList skipped={preview.skipped} empty="Todos los clientes de la audiencia lo recibirían." />
    </>
  )
}

/** Resultado por cliente y omitidos de "Ejecutar ahora" (exportado para probarlo sin el diálogo). */
export function RunNowResultContent({ result, actionType }: { result: WorkflowRunNowResult | null; actionType: string }) {
  const executed = result?.executed ?? []
  const skipped = result?.skipped ?? []
  return (
    <>
      <ListSection
        title="Resultado por cliente"
        count={executed.length}
        icon={<Play className="size-4 text-primary" />}
        empty="No se ejecutó para ningún cliente."
        testId="run-now-executed"
      >
        {executed.map((c) => {
          const meta = runResultMeta(c, actionType)
          return (
            <li key={c.clientId} className="flex flex-col gap-1 px-3 py-2 text-xs" data-run-tone={meta.tone}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{c.name || c.clientId}</span>
                <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold', RUN_TONE_CLASSES[meta.tone])}>
                  {meta.label}
                </span>
              </div>
              {meta.tone === 'error' && c.detail && <p className="text-destructive">{c.detail}</p>}
            </li>
          )
        })}
      </ListSection>
      <SkippedList skipped={skipped} empty="No se omitió a ningún cliente." />
    </>
  )
}
