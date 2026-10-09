import { useMemo } from 'react'
import { FileText, Sparkles, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ProjectContractDraftInput } from '@/features/collab/api'
import { buildDraftContractSnapshot } from '@/features/collab/lib/contract-draft-builder'
import { parseContractDocument, type ParsedClause } from '@/features/collab/lib/contract-parser'

type Props = {
  projectName: string
  values: ProjectContractDraftInput
  hasContract: boolean
  contentSnapshot?: string | null
}

function LiveClauseView({ clause, index }: { clause: ParsedClause; index: number }) {
  return (
    <article className="rounded-lg border border-border/60 bg-muted/20 p-3.5 transition-colors hover:border-primary/20">
      <header className="mb-2 flex items-center gap-2 border-b border-border/40 pb-1.5">
        <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
          {index + 1}
        </span>
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-foreground">
          {clause.title}
        </h5>
      </header>

      <div className="space-y-1.5 text-xs leading-relaxed text-foreground/90">
        {clause.bodyLines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      {clause.paragraphs.length > 0 && (
        <div className="mt-2.5 space-y-1.5">
          {clause.paragraphs.map((para, i) => (
            <div
              key={i}
              className="rounded-md border border-primary/20 bg-primary/5 p-2 text-[11px] leading-relaxed text-foreground"
            >
              {para}
            </div>
          ))}
        </div>
      )}
    </article>
  )
}

export function ContractLiveSheet({
  projectName,
  values,
  hasContract,
  contentSnapshot,
}: Props) {
  const rawText = useMemo(() => {
    return contentSnapshot || buildDraftContractSnapshot(values, projectName)
  }, [contentSnapshot, values, projectName])

  const parsed = useMemo(() => parseContractDocument(rawText), [rawText])

  return (
    <section className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden flex flex-col">
      <header className="flex items-center justify-between border-b bg-muted/25 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-primary shrink-0" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            HOJA DE CONTRATO
          </h4>
        </div>

        <Badge
          variant={hasContract ? 'default' : 'secondary'}
          className="gap-1 text-[10px] font-semibold"
        >
          {hasContract ? (
            <>
              <ShieldCheck className="size-3 text-emerald-500" />
              Sello oficial registrado
            </>
          ) : (
            <>
              <Sparkles className="size-3 text-amber-500" />
              Borrador en tiempo real
            </>
          )}
        </Badge>
      </header>

      <div className="p-4 bg-background/50 max-h-[580px] overflow-y-auto space-y-4">
        <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-2xs space-y-3.5">
          <div className="text-center pb-3 border-b border-border/50 space-y-1">
            <p className="text-[11px] font-bold tracking-widest uppercase text-primary">
              CIMAXIS · CONTRATO DIGITAL
            </p>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {parsed.title || 'CONTRATO DE PRESTACIÓN DE SERVICIOS'}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Proyecto: <span className="text-foreground">{projectName}</span>
            </p>
          </div>

          {parsed.preamble && (
            <p className="text-xs leading-relaxed text-foreground/90 italic bg-muted/30 p-2.5 rounded-lg border border-border/40">
              {parsed.preamble}
            </p>
          )}

          <div className="space-y-3">
            {parsed.clauses.map((clause, idx) => (
              <LiveClauseView key={idx} clause={clause} index={idx} />
            ))}
          </div>

          {parsed.additionalTerms && (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs space-y-1">
              <h5 className="font-bold text-foreground uppercase text-[11px]">
                Condiciones adicionales
              </h5>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {parsed.additionalTerms}
              </p>
            </div>
          )}

          {parsed.closingLines.length > 0 && (
            <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground space-y-1">
              {parsed.closingLines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
