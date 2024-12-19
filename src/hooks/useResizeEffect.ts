import { useEffect, useRef, type DependencyList, type RefObject } from 'react'
import ResizeObserver from 'resize-observer-polyfill'

export type UseResizeEffectOptions = {
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
 * @param deps Additional dependencies.
 */
export function useResizeEffect(targetRef: RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>, { onResize }: UseResizeEffectOptions = {}, deps: DependencyList = []) {
  const observerRef = useRef<ResizeObserver | undefined>(undefined)

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
  }, [targetRef.current, ...deps])
}
