import { cn } from '@/shared/lib/utils'
import { useClient360 } from './client360-context'

interface ClientNameButtonProps {
  clientId?: string | null
  name: string
  className?: string
}

/**
 * Nombre de un cliente que abre su ficha 360° al hacer clic. Sin proveedor de
 * ficha o sin clientId se muestra como texto normal.
 */
export function ClientNameButton({ clientId, name, className }: ClientNameButtonProps) {
  const client360 = useClient360()
  if (!client360 || !clientId) return <span className={className}>{name}</span>
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        client360.openClient360({ clientId, name })
      }}
      className={cn(
        'cursor-pointer rounded-sm text-left underline-offset-2 hover:text-primary hover:underline',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        className
      )}
      title="Ver ficha 360° del cliente"
      data-client360-link={clientId}
    >
      {name}
    </button>
  )
}
