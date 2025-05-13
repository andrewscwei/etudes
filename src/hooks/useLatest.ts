import { useEffect, useRef, type RefObject } from 'react'

/**
 * Hook for storing the latest value in a ref.
 *
 * @param value The value to store.
 *
 * @returns A ref object containing the latest value.
 */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref
}
