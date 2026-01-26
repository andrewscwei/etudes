import { type RefObject, useLayoutEffect } from 'react'
import { useLatest } from './useLatest.js'

/**
 * Hook for monitoring the change in intersection between the target element and
 * the viewport.
 *
 * @param target The target element or the reference to it.
 * @param handler Handler invoked when the intersection changes.
 */
export function useIntersectionObserver(
  target: HTMLElement | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | null | undefined,
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
