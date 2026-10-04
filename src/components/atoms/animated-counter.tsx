import { forwardRef, useImperativeHandle, useRef, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import {
  useAnimatedCounter,
  type UseAnimatedCounterOptions,
} from '@/shared/hooks/use-animated-counter'

export type AnimatedCounterProps = {
  value: ReactNode
  className?: string
  as?: 'span' | 'div' | 'p'
} & UseAnimatedCounterOptions &
  Omit<React.HTMLAttributes<HTMLElement>, 'children'>

export const AnimatedCounter = forwardRef<HTMLElement, AnimatedCounterProps>(
  function AnimatedCounter(
    {
      value,
      className,
      duration = 600,
      decimals,
      prefix,
      suffix,
      thousandsSeparator,
      decimalSeparator,
      disabled = false,
      initialValue,
      easeFn,
      onComplete,
      as: Tag = 'span',
      ...rest
    },
    forwardedRef
  ) {
    const internalRef = useRef<HTMLElement>(null)
    useImperativeHandle(forwardedRef, () => internalRef.current as HTMLElement)

    const displayValue = useAnimatedCounter(value, {
      duration,
      decimals,
      prefix,
      suffix,
      thousandsSeparator,
      decimalSeparator,
      disabled,
      initialValue,
      easeFn,
      onComplete,
      elementRef: internalRef,
    })

    const classes = cn('inline-block tabular-nums', className)
    return (
      <Tag
        ref={internalRef as unknown as React.RefObject<never>}
        className={classes}
        {...rest}
      >
        {displayValue}
      </Tag>
    )
  }
)
