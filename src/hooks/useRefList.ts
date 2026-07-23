import { useRef } from 'react'

type Nullable<T> = null | T

/**
 * Hook for creating a list of element references.
 *
 * @template T The type of the element.
 *
 * @returns A tuple containing the list of element references and a function to
 *          set the reference at a specific index.
 */
export function useRefList<T extends HTMLElement>() {
  const elementRefs = useRef<Nullable<T>[]>([])
  const setterRefs = useRef<((el: Nullable<T>) => () => void)[]>([])

  const setElementRefAt = (idx: number) => (setterRefs.current[idx] ??= (el: Nullable<T>) => {
    elementRefs.current[idx] = el

    return () => {
      elementRefs.current[idx] = null
    }
  })

  return [elementRefs, setElementRefAt] as const
}
