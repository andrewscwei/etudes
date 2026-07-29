import { type RefObject, useLayoutEffect } from 'react'

import { useLatest } from './useLatest.js'

type Target = HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined

/**
 * Hook for monitoring the resizing event of the target element.
 *
 * @param target The target element or reference.
 * @param options See {@link UseSizeObserverOptions}.
 */
export function useSizeObserver(target: Target, handler: (element: HTMLElement) => void) {
  const handlerRef = useLatest(handler)

  useLayoutEffect(() => {
    const element = target && 'current' in target ? target.current : target
    if (!element) return

    const observer = new ResizeObserver(() => {
      handlerRef.current?.(element)
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [target && 'current' in target ? target.current : target])
}
