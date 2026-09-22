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
      className="flex w-full items-start justify-between gap-3 rounded-lg border border-border/60 p-2.5 text-left transition-colors hover:bg-muted/60 hover:border-primary/30 group cursor-pointer"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
            {question.question}
          </p>
          {scopeMode === 'all' && (
            <Badge variant="outline" className="text-[9px] py-0 px-1 font-normal text-muted-foreground">
              {tabLabel ?? question.tab}
            </Badge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {question.answer}
        </p>
      </div>
      <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </button>
  )
}
