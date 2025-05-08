import { useEffect, useRef, type RefObject } from 'react'

type TargetRef = RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>

/**
 * Type describing the options for {@link useSizeObserver}.
 */
export type UseSizeObserverOptions = {
  /**
   * Handler invoked when the target element resizes.
   *
   * @param element The target element.
   */
  onResize?: (element: HTMLElement) => void
}

/**
 * Hook for monitoring the resizing event of the target element.
 *
 * @param targetRef Reference to the target element.
 * @param options See {@link Options}.
 */
export function useSizeObserver(targetRef: TargetRef, { onResize }: UseSizeObserverOptions = {}) {
  const observerRef = useRef<ResizeObserver>(undefined)

  useEffect(() => {
    observerRef.current = new ResizeObserver(() => {
      const element = targetRef.current
      if (!element) return

      onResize?.(element)
    })

    if (observerRef.current && targetRef.current) {
      observerRef.current.observe(targetRef.current)
    }

    return () => {
      if (observerRef.current && targetRef.current) {
        observerRef.current.unobserve(targetRef.current)
      }
    }
  }, [targetRef.current, onResize])
}
