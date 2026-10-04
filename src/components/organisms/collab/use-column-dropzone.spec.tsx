import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { useColumnDropzone } from './use-column-dropzone'

function TestDropzoneConsumer({
  canDrag = true,
  onDropTask = vi.fn(),
}: {
  canDrag?: boolean
  onDropTask?: (id: string) => void
}) {
  const { isDragOver } = useColumnDropzone({ canDrag, onDropTask })
  return <div data-drag-over={isDragOver}>Dropzone</div>
}

describe('useColumnDropzone', () => {
  it('inicializa con isDragOver en false', () => {
    const markup = renderToStaticMarkup(<TestDropzoneConsumer canDrag={true} />)
    expect(markup).toContain('data-drag-over="false"')
  })

  it('respeta la inicialización con canDrag false', () => {
    const markup = renderToStaticMarkup(<TestDropzoneConsumer canDrag={false} />)
    expect(markup).toContain('data-drag-over="false"')
  })
})
