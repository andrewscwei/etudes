import { type RefObject, useLayoutEffect } from 'react'

import { useLatest } from './useLatest.js'

/**
 * Hook for monitoring the change in intersection between the target element and
 * the viewport.
 *
 * @param target The target element or reference.
 * @param handler Handler invoked when the intersection changes.
 */
export function useIntersectionObserver(
  target: HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined,
  handler: (element: HTMLElement) => void,
) {
  const handlerRef = useLatest(handler)

  useLayoutEffect(() => {
    const element = target && 'current' in target ? target.current : target
    if (!element) return

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === element) {
          handlerRef.current?.(element)
          break
        }
      }
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [target])
}
