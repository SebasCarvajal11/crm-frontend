import ReactMarkdown from 'react-markdown'
import { cn } from '@/shared/lib/utils'

type Props = {
  content: string
  className?: string
}

export function BriefMarkdown({ content, className }: Props) {
  return (
    <article
      className={cn(
        'brief-document max-w-none text-sm text-foreground/90 selection:bg-primary/20',
        className,
      )}
    >
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pb-3 mb-5 border-b border-border/70 flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-primary shrink-0" />
              <span>{children}</span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold text-foreground mt-6 mb-3 flex items-center gap-2.5 border-l-2 border-primary pl-3 py-0.5">
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-foreground/90 mt-4 mb-2 pl-3">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed text-muted-foreground mb-3.5 font-normal">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 my-3 pl-1 text-sm list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 my-3 pl-4 text-sm list-decimal text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2.5 text-sm text-foreground/80 leading-normal">
              <span className="mt-1.5 size-1.5 rounded-full bg-primary/80 shrink-0" />
              <div className="flex-1 min-w-0">{children}</div>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="rounded-r-lg border-l-4 border-primary bg-primary/5 px-4 py-3 my-4 text-sm text-foreground/90 font-medium italic">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
