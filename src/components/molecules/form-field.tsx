import * as React from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/shared/lib/utils'

export type FormFieldControlProps = {
  id: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

type FormFieldProps = {
  id: string
  label: string
  error?: string
  hint?: string
  /**
   * Control del campo: elemento React (p. ej. `<Input />`) o función que recibe props a11y
   * para aplicarlas al nodo DOM real (recomendado con Select, Controller, etc.).
   */
  children: React.ReactNode | ((control: FormFieldControlProps) => React.ReactNode)
  className?: string
}

function mergeControlElement(
  child: React.ReactElement<Record<string, unknown>>,
  control: FormFieldControlProps,
): React.ReactElement {
  const prev = child.props as Partial<FormFieldControlProps>
  return React.cloneElement(child, {
    ...control,
    id: control.id,
    'aria-invalid': control['aria-invalid'],
    'aria-describedby': control['aria-describedby'] ?? prev['aria-describedby'],
  })
}

/** Molécula: etiqueta + control + error/hint con ids y ARIA enlazados. */
export function FormField({ id, label, error, hint, children, className }: FormFieldProps) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

  const controlProps: FormFieldControlProps = {
    id,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy || undefined,
  }

  let control: React.ReactNode
  if (typeof children === 'function') {
    control = children(controlProps)
  } else if (React.isValidElement(children)) {
    control = mergeControlElement(children as React.ReactElement<Record<string, unknown>>, controlProps)
  } else {
    control = children
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {control}
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
