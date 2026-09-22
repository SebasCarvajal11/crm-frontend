import { useState } from 'react'
import { MoreHorizontal, RotateCcw, ShieldAlert, UserCheck, UserX, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AdminUserRow } from '@/features/admin/model'

type MutationHandle<T> = {
  mutate: (arg: T) => void
  isPending: boolean
}

type Props = {
  row: AdminUserRow
  patchStatus: MutationHandle<{ subject: string; is_active: boolean }>
  patchFlags: MutationHandle<{ subject: string; force_password_change: boolean }>
  softDelete: MutationHandle<string>
  restore: MutationHandle<string>
  clearActionMessage: () => void
}

/** Organismo: acciones de administracion para una fila de usuario (activar, archivar, restaurar). */
export function AdminUserActions({
  row,
  patchStatus,
  patchFlags,
  softDelete,
  restore,
  clearActionMessage,
}: Props) {
  const busy =
    patchStatus.isPending ||
    patchFlags.isPending ||
    softDelete.isPending ||
    restore.isPending
  const [archiveOpen, setArchiveOpen] = useState(false)

  if (row.deleted_at) {
    return (
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-3 text-xs font-medium"
          disabled={busy}
          onClick={() => {
            clearActionMessage()
            restore.mutate(row.id)
          }}
        >
          <RotateCcw className="size-3.5" /> Restaurar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="hidden sm:inline-flex h-8 px-2.5 text-xs font-medium"
        disabled={busy}
        onClick={() => {
          clearActionMessage()
          patchStatus.mutate({ subject: row.id, is_active: !row.is_active })
        }}
      >
        {row.is_active ? 'Desactivar' : 'Activar'}
      </Button>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={
              'hidden sm:inline-flex h-8 px-2 text-xs font-medium ' +
              'text-destructive hover:bg-destructive/10 hover:text-destructive'
            }
            disabled={busy}
          >
            Archivar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <ShieldAlert className="size-6 text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Archivar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Se revocarán las sesiones activas. Puedes restaurar desde la vista con
              &quot;Incluir archivados&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                clearActionMessage()
                softDelete.mutate(row.id)
                setArchiveOpen(false)
              }}
            >
              Archivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={busy}
            aria-label={`Acciones para ${row.email}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="sm:hidden">
            <DropdownMenuLabel>Gestión de usuario</DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={() => {
                clearActionMessage()
                patchStatus.mutate({ subject: row.id, is_active: !row.is_active })
              }}
            >
              {row.is_active ? (
                <>
                  <UserX className="size-4 text-amber-500" />
                  Desactivar usuario
                </>
              ) : (
                <>
                  <UserCheck className="size-4 text-emerald-500" />
                  Activar usuario
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setArchiveOpen(true)}
            >
              <Trash2 className="size-4" />
              Archivar usuario
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </div>

          <DropdownMenuLabel>Seguridad de cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator className="hidden sm:block" />
          <DropdownMenuItem
            onSelect={() => {
              clearActionMessage()
              patchFlags.mutate({
                subject: row.id,
                force_password_change: !row.force_password_change,
              })
            }}
          >
            <ShieldAlert className="size-4" />
            {row.force_password_change
              ? 'Quitar cambio obligatorio'
              : 'Forzar cambio de contraseña'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
