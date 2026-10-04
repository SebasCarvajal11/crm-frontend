import { useEffect, useState } from 'react'

export type UseColumnDropzoneOptions = {
  canDrag: boolean
  onDropTask: (taskId: string) => void
}

export function useColumnDropzone({ canDrag, onDropTask }: UseColumnDropzoneOptions) {
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    if (!isDragOver) return
    const handleDragEnd = () => setIsDragOver(false)
    window.addEventListener('dragend', handleDragEnd)
    return () => window.removeEventListener('dragend', handleDragEnd)
  }, [isDragOver])

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    if (!canDrag) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!isDragOver) setIsDragOver(true)
  }

  const onDragLeave = (e: React.DragEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const onDrop = (e: React.DragEvent<HTMLElement>) => {
    if (!canDrag) return
    e.preventDefault()
    setIsDragOver(false)
    const id = e.dataTransfer.getData('text/task-id')
    if (id) onDropTask(id)
  }

  return { isDragOver, onDragOver, onDragLeave, onDrop }
}
