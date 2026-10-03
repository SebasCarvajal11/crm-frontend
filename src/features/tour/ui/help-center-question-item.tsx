import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { GuidedQuestion } from '../model/types'

interface Props {
  question: GuidedQuestion
  scopeMode: 'section' | 'all'
  tabLabel?: string
  onClick: () => void
}

export function HelpCenterQuestionItem({ question, scopeMode, tabLabel, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 w-full items-start justify-between gap-3 rounded-lg border border-border/60 p-3 text-left transition-colors hover:bg-muted/60 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group cursor-pointer"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {question.question}
          </p>
          {scopeMode === 'all' && (
            <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal text-muted-foreground">
              {tabLabel ?? question.tab}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {question.answer}
        </p>
      </div>
      <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </button>
  )
}
