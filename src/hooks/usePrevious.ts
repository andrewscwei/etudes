import { useEffect, useRef } from 'react'

/**
 * Returns the previous value of a state or prop.
 *
 * @param stateOrProp The state or prop.
 */
export default function usePrevious<T>(stateOrProp: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = stateOrProp
  }, [stateOrProp])

  return ref.current
}
