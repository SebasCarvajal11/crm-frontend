import { useMemo, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type Block =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'p'; text: string }

function parseInline(text: string): ReactNode {
  // Soporte simple para negritas **texto**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function parseMarkdownBlocks(raw: string): Block[] {
  const lines = raw.split(/\r?\n/)
  const blocks: Block[] = []
  let currentList: string[] = []

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: 'ul', items: [...currentList] })
      currentList = []
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      flushList()
      continue
    }

    if (line.startsWith('# ')) {
      flushList()
      blocks.push({ type: 'h1', text: line.slice(2).trim() })
    } else if (line.startsWith('## ')) {
      flushList()
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
    } else if (line.startsWith('### ')) {
      flushList()
      blocks.push({ type: 'h3', text: line.slice(4).trim() })
    } else if (line.startsWith('> ')) {
      flushList()
      blocks.push({ type: 'blockquote', text: line.slice(2).trim() })
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      currentList.push(line.slice(2).trim())
    } else {
      flushList()
      blocks.push({ type: 'p', text: line })
    }
  }

  flushList()
  return blocks
}

type Props = {
  content: string
  className?: string
}

export function BriefMarkdown({ content, className }: Props) {
  const blocks = useMemo(() => parseMarkdownBlocks(content), [content])

  return (
    <article className={cn('brief-document space-y-4 text-sm text-foreground/90 selection:bg-primary/20', className)}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h1
                key={idx}
                className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pb-3 mb-5 border-b border-border/70 flex items-center gap-2.5"
              >
                <span className="size-2 rounded-full bg-primary shrink-0" />
                <span>{parseInline(block.text)}</span>
              </h1>
            )
          case 'h2':
            return (
              <h2
                key={idx}
                className="text-base font-semibold text-foreground mt-6 mb-3 flex items-center gap-2.5 border-l-2 border-primary pl-3 py-0.5"
              >
                <span>{parseInline(block.text)}</span>
              </h2>
            )
          case 'h3':
            return (
              <h3 key={idx} className="text-sm font-semibold text-foreground/90 mt-4 mb-2 pl-3">
                {parseInline(block.text)}
              </h3>
            )
          case 'blockquote':
            return (
              <blockquote
                key={idx}
                className="rounded-r-lg border-l-2 border-primary/60 bg-muted/40 px-4 py-2.5 my-3 text-sm text-foreground/90 font-medium italic"
              >
                {parseInline(block.text)}
              </blockquote>
            )
          case 'ul':
            return (
              <ul key={idx} className="space-y-2 my-3 pl-1 text-sm list-none">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-sm text-foreground/80 leading-normal">
                    <span className="mt-1.5 size-1.5 rounded-full bg-primary/80 shrink-0" />
                    <div className="flex-1 min-w-0">{parseInline(item)}</div>
                  </li>
                ))}
              </ul>
            )
          case 'p':
            return (
              <p key={idx} className="text-sm leading-relaxed text-muted-foreground mb-3 font-normal">
                {parseInline(block.text)}
              </p>
            )
          default:
            return null
        }
      })}
    </article>
  )
}
