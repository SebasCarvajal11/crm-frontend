import { useMemo } from 'react'
import { FileCheck, ShieldCheck } from 'lucide-react'
import { parseContractDocument, type ParsedClause } from '@/features/collab/lib/contract-parser'

type Props = {
  content: string | null | undefined
  className?: string
}

function highlightContractText(text: string) {
  const parts = text.split(/(EL PRESTADOR|EL CLIENTE)/g)
  if (parts.length === 1) return text

  return parts.map((part, index) => {
    if (part === 'EL PRESTADOR' || part === 'EL CLIENTE') {
      return (
        <strong key={index} className="font-bold text-foreground">
          {part}
        </strong>
      )
    }
    return part
  })
}

function ClauseCard({ clause, index }: { clause: ParsedClause; index: number }) {
  return (
    <article className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs transition-colors hover:border-primary/30">
      <header className="mb-2.5 flex items-center gap-2 border-b border-border/40 pb-2">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
          {index + 1}
        </span>
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
          {clause.title}
        </h4>
      </header>

      <div className="space-y-2 text-xs leading-relaxed text-foreground/90 lg:text-sm">
        {clause.bodyLines.map((line, i) => (
          <p key={i}>{highlightContractText(line)}</p>
        ))}
      </div>

      {clause.paragraphs.length > 0 && (
        <div className="mt-3 space-y-2">
          {clause.paragraphs.map((para, i) => {
            const dotIndex = para.indexOf('.')
            const prefix = dotIndex !== -1 ? para.slice(0, dotIndex + 1) : para
            const rest = dotIndex !== -1 ? para.slice(dotIndex + 1).trim() : ''
            return (
              <div
                key={i}
                className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-xs leading-relaxed text-foreground/95"
              >
                <strong className="font-bold text-primary">{prefix}</strong>{' '}
                {highlightContractText(rest)}
              </div>
            )
          })}
        </div>
      )}
    </article>
  )
}

function PreambleSection({ text }: { text: string }) {
  return (
    <section className="rounded-xl border border-border/80 bg-muted/30 p-4 text-xs leading-relaxed text-foreground/90 shadow-2xs lg:text-sm">
      <p className="font-medium text-foreground">{highlightContractText(text)}</p>
    </section>
  )
}

function AdditionalTermsSection({ terms }: { terms: string }) {
  return (
    <section className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground">
        Condiciones adicionales
      </h4>
      <p className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90 lg:text-sm">
        {terms}
      </p>
    </section>
  )
}

function ClosingSection({ lines }: { lines: string[] }) {
  return (
    <section className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground/90 space-y-2 shadow-2xs">
      <div className="flex items-center gap-1.5 font-bold text-primary text-xs uppercase tracking-wide">
        <ShieldCheck className="size-4 shrink-0 text-primary" />
        Declaración de consentimiento y cierre
      </div>
      {lines.map((line, idx) => (
        <p key={idx} className="leading-relaxed font-medium">
          {line}
        </p>
      ))}
    </section>
  )
}

export function ContractDocumentReader({ content, className = '' }: Props) {
  const parsed = useMemo(() => parseContractDocument(content ?? ''), [content])

  if (!content) {
    return (
      <div className={`flex items-center justify-center p-8 text-center text-sm text-muted-foreground ${className}`}>
        Este borrador se convertirá en un documento inmutable cuando el administrador habilite la firma.
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <header className="rounded-xl border bg-gradient-to-br from-card to-muted/20 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            <FileCheck className="size-3.5" />
            Documento contractual oficial
          </span>
          {parsed.project && (
            <span className="text-xs font-semibold text-muted-foreground">
              Proyecto: <strong className="text-foreground font-bold">{parsed.project}</strong>
            </span>
          )}
        </div>
        <h2 className="text-sm lg:text-base font-bold uppercase tracking-tight text-foreground">
          {parsed.title || 'Contrato de prestación de servicios'}
        </h2>
      </header>

      {parsed.preamble && <PreambleSection text={parsed.preamble} />}

      <div className="space-y-3">
        {parsed.clauses.map((clause, index) => (
          <ClauseCard key={clause.title} clause={clause} index={index} />
        ))}
      </div>

      {parsed.additionalTerms && <AdditionalTermsSection terms={parsed.additionalTerms} />}

      {parsed.closingLines.length > 0 && <ClosingSection lines={parsed.closingLines} />}

      {parsed.fallbackLines.length > 0 && (
        <div className="rounded-lg border bg-muted/15 p-4 text-xs text-muted-foreground space-y-1">
          {parsed.fallbackLines.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}
