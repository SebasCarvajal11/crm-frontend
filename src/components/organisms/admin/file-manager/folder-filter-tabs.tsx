import { Button } from '@/components/ui/button'
import type { StorageFolderSummary } from '@/features/admin/api/admin-storage-explorer.api'

interface Props {
  folders: Record<string, StorageFolderSummary>
  selectedFolder: string | null
  totalFiles: number
  onSelectFolder: (folderKey: string | null) => void
}

export function FolderFilterTabs({
  folders,
  selectedFolder,
  totalFiles,
  onSelectFolder,
}: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Button
        variant={selectedFolder === null ? 'default' : 'outline'}
        size="sm"
        className="h-7 text-xs"
        onClick={() => onSelectFolder(null)}
      >
        Todos ({totalFiles})
      </Button>
      {Object.values(folders).map((f) => (
        <Button
          key={f.folderKey}
          variant={selectedFolder === f.folderKey ? 'default' : 'outline'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => onSelectFolder(f.folderKey)}
        >
          {f.folderLabel} ({f.files.length})
        </Button>
      ))}
    </div>
  )
}
