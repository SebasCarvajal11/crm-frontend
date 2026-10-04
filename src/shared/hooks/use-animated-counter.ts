import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  formatAnimatedValue,
  parseNumericValue,
  type ParsedNumericSpec,
  type ParseOptions,
} from '@/shared/lib/number-parser'
import { usePrefersReducedMotion } from './use-prefers-reduced-motion'
import { useElementInViewport } from './use-element-in-viewport'

export interface UseAnimatedCounterOptions extends ParseOptions {
  duration?: number
  disabled?: boolean
  initialValue?: number | null
  elementRef?: React.RefObject<HTMLElement | null>
  easeFn?: (t: number) => number
  onComplete?: () => void
}

interface RafLoopParams {
  spec: ParsedNumericSpec
  isBypassed: boolean
  isInViewport: boolean
  duration: number
  easeFn: (t: number) => number
  onComplete?: () => void
  initialNum: number
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function useParsedCounterSpec(value: ReactNode, options: ParseOptions): ParsedNumericSpec {
  const { prefix, suffix, decimals, thousandsSeparator, decimalSeparator, hasExplicitPlus } = options
  const parseOptions: ParseOptions = useMemo(
    () => ({ prefix, suffix, decimals, thousandsSeparator, decimalSeparator, hasExplicitPlus }),
    [prefix, suffix, decimals, thousandsSeparator, decimalSeparator, hasExplicitPlus]
  )
  return useMemo(() => parseNumericValue(value, parseOptions), [value, parseOptions])
}

function stepCounterTick(
  now: number,
  startTime: number,
  startVal: number,
  targetVal: number,
  duration: number,
  easeFn: (t: number) => number
): { current: number; isDone: boolean } {
  const progress = duration <= 0 ? 1 : Math.min((now - startTime) / duration, 1)
  const current = startVal + (targetVal - startVal) * easeFn(progress)
  return { current, isDone: progress >= 1 }
}

function useCounterRafLoop(params: RafLoopParams): string {
  const { spec, isBypassed, isInViewport, duration, easeFn, onComplete, initialNum } = params
  const [displayValue, setDisplayValue] = useState<string>(() => formatAnimatedValue(initialNum, spec))
  const currentNumRef = useRef<number>(initialNum)
  const rafIdRef = useRef<number | null>(null)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    if (isBypassed) { currentNumRef.current = spec.target; return }
    if (!isInViewport || currentNumRef.current === spec.target) return
    const startVal = currentNumRef.current
    let startTime: number | null = null

    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const { current, isDone } = stepCounterTick(now, startTime, startVal, spec.target, duration, easeFn)
      currentNumRef.current = current
      setDisplayValue(formatAnimatedValue(current, spec))
      if (!isDone) {
        rafIdRef.current = requestAnimationFrame(tick)
      } else {
        currentNumRef.current = spec.target
        setDisplayValue(formatAnimatedValue(spec.target, spec))
        rafIdRef.current = null
        onCompleteRef.current?.()
      }
    }
    rafIdRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafIdRef.current !== null) { cancelAnimationFrame(rafIdRef.current); rafIdRef.current = null }
    }
  }, [spec, isBypassed, isInViewport, duration, easeFn])
  return displayValue
}

export function useAnimatedCounter(
  value: ReactNode,
  options: UseAnimatedCounterOptions = {}
): ReactNode {
  const {
    duration = 600,
    disabled = false,
    initialValue,
    elementRef,
    easeFn = easeOutCubic,
    onComplete,
    prefix,
    suffix,
    decimals,
    thousandsSeparator,
    decimalSeparator,
    hasExplicitPlus,
  } = options

  const reducedMotion = usePrefersReducedMotion()
  const isInViewport = useElementInViewport(elementRef, !disabled)
  const isClient = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
  const spec = useParsedCounterSpec(value, {
    prefix, suffix, decimals, thousandsSeparator, decimalSeparator, hasExplicitPlus,
  })

  const isBypassed = !spec.isNumeric || reducedMotion || disabled || !isClient
  const initialNum = initialValue === null ? spec.target : (initialValue ?? 0)
  const displayValue = useCounterRafLoop({
    spec,
    isBypassed,
    isInViewport,
    duration,
    easeFn,
    onComplete,
    initialNum,
  })

  if (!spec.isNumeric) return value
  if (isBypassed) return formatAnimatedValue(spec.target, spec)
  return displayValue
}
