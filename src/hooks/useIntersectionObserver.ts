import { useLayoutEffect, type RefObject } from 'react'
import { useLatest } from './useLatest.js'

type TargetRef = RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>

/**
 * Type describing the options for {@link useIntersectionObserver}.
 */
export type UseIntersectionObserverOptions = {
  /**
   * Handler invoked when the target element's intersection with the viewport
   * changes.
   *
   * @param element The target element.
   */
  onChange: (element: HTMLElement) => void
}

/**
 * Hook for monitoring the change in intersection between the target element and
 * the viewport.
 *
 * @param targetRef Reference to the target element.
 * @param options See {@link UseIntersectionObserverOptions}.
 */
export function useIntersectionObserver(targetRef: TargetRef, { onChange }: UseIntersectionObserverOptions) {
  const handlerRef = useLatest(onChange)

  useLayoutEffect(() => {
    const element = targetRef.current
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
  }, [targetRef.current])
}
