import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

type IconButtonProps = Omit<ComponentProps<typeof Button>, 'aria-label' | 'children'> & {
  label: string
  children: ReactNode
}

/**
 * Acción compacta solo con icono.
 * Centraliza tamaños, estados de foco y etiqueta accesible para utilidades
 * como cerrar, eliminar y descargar.
 */
export function IconButton({
  label,
  type = 'button',
  variant = 'ghost',
  size = 'icon-sm',
  ...props
}: IconButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      aria-label={label}
      title={label}
      {...props}
    />
  )
}
