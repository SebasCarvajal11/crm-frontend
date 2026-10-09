import { useState } from 'react'
import { ChevronDown, ChevronUp, LocateFixed, Check, X, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTourStore } from '../model/tour-store'
import type { GuidedQuestion } from '../model/types'

interface Props {
  question: GuidedQuestion
  scopeMode: 'section' | 'all'
  tabLabel?: string
  onClick?: () => void
  onHighlight?: () => void
}

export function QuestionExpandedBody({
  answer,
  canHighlight,
  feedback,
  onHighlight,
  onFeedback,
}: {
  answer: string
  canHighlight: boolean
  feedback?: 'helpful' | 'unhelpful'
  onHighlight?: () => void
  onFeedback?: (val: 'helpful' | 'unhelpful') => void
}) {
  return (
    <div className="mt-2.5 pt-2.5 border-t border-border/40 space-y-2.5">
      <p className="text-xs leading-relaxed text-muted-foreground">{answer}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/30">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {feedback ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3" />
              ¡Gracias por tu valoración!
            </span>
          ) : (
            <>
              <span>¿Te fue útil?</span>
              <button
                type="button"
                onClick={() => onFeedback?.('helpful')}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md hover:bg-muted
                  text-muted-foreground hover:text-foreground cursor-pointer text-[10px]"
              >
                <Check className="size-2.5 text-emerald-600" />
                Sí
              </button>
              <button
                type="button"
                onClick={() => onFeedback?.('unhelpful')}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md hover:bg-muted
                  text-muted-foreground hover:text-foreground cursor-pointer text-[10px]"
              >
                <X className="size-2.5 text-muted-foreground" />
                No me sirvió
              </button>
            </>
          )}
        </div>
        {canHighlight && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[10px] gap-1 rounded-md text-primary hover:text-primary cursor-pointer px-2"
            onClick={onHighlight}
          >
            <LocateFixed className="size-3" />
            Localizar en pantalla
          </Button>
        )}
      </div>
    </div>
  )
}

export function HelpCenterQuestionItem({
  question,
  scopeMode,
  tabLabel,
  onClick,
  onHighlight,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const feedback = useTourStore((s) => s.feedbackByQuestionId[question.id])
  const setFeedback = useTourStore((s) => s.setFeedback)
  const handleHighlight = onHighlight ?? onClick
  const canHighlight = Boolean(handleHighlight && (question.targetElement || question.tourId))

  return (
    <article
      data-testid="help-question-item"
      className="rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/30 shadow-2xs"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={handleHighlight}
          className="flex flex-1 items-start gap-2 text-left cursor-pointer group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-semibold leading-relaxed text-foreground group-hover:text-primary transition-colors">
                {question.question}
              </h4>
              {scopeMode === 'all' && (
                <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal text-muted-foreground">
                  {tabLabel ?? question.tab}
                </Badge>
              )}
            </div>
            {!expanded && (
              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-1">
                {question.answer}
              </p>
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((prev) => !prev)
          }}
          aria-expanded={expanded}
          aria-label={expanded ? 'Ocultar respuesta' : 'Ver respuesta completa'}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
        >
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {expanded && (
        <QuestionExpandedBody
          answer={question.answer}
          canHighlight={canHighlight}
          feedback={feedback}
          onHighlight={handleHighlight}
          onFeedback={(val) => setFeedback(question.id, val)}
        />
      )}
    </article>
  )
}
