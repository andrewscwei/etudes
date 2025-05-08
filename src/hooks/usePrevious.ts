import { useEffect, useRef } from 'react'

/**
 * Type describing the options of {@link usePrevious}.
 */
export type UsePreviousOptions<T> = {
  /**
   * Function to transform the dependency value in the dependency list, useful
   * if the value is a reference.
   *
   * @param dependency The dependency value.
   *
   * @returns The transformed value to be used as the dependency value instead.
   */
  sanitizeDependency?: (dependency: T) => any
}

/**
 * Returns the previous value of a value.
 *
 * @param value The value.
 * @param options See {@link UsePreviousOptions}.
 */
export function usePrevious<T>(value: T, { sanitizeDependency = t => t }: UsePreviousOptions<T> = {}): T | undefined {
  const ref = useRef<T>(undefined)

  useEffect(() => {
    ref.current = value
  }, [sanitizeDependency(value)])

  return ref.current
}
