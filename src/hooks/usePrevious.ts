import { useLayoutEffect, useRef } from 'react'

/**
 * Returns the previous value of a value.
 *
 * @param value The value.
 * @param initialValue The initial value to return on the first render. If not
 *                     provided, the hook will return `undefined` on the first
 *                     render.
 *
 * @returns The previous value.
 */
export function usePrevious<T>(value: T, initialValue: T): T
export function usePrevious<T>(value: T): T | undefined
export function usePrevious<T>(value: T, initialValue?: T): T | undefined {
  const ref = useRef<T | undefined>(initialValue)

  useLayoutEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
