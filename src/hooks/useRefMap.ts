import { useRef } from 'react'

type Nullable<T> = null | T

/**
 * Hook for creating a map of element references.
 *
 * @template T The type of the element.
 *
 * @returns A tuple containing the map of element references and a function to
 *          set the reference for a specific key.
 */
export function useRefMap<T extends HTMLElement>() {
  const elementRefs = useRef<Map<string, Nullable<T>>>(new Map())
  const setterRefs = useRef<Map<string, (el: Nullable<T>) => () => void>>(new Map())

  const setElementRefAt = (key: string) => {
    const existing = setterRefs.current.get(key)
    if (existing) return existing

    const setter = (el: Nullable<T>) => {
      elementRefs.current.set(key, el)

      return () => {
        elementRefs.current.set(key, null)
      }
    }

    setterRefs.current.set(key, setter)

    return setter
  }

  return [elementRefs, setElementRefAt] as const
}
