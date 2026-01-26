import { useLayoutEffect, type RefObject } from 'react'
import { useLatest } from './useLatest.js'

/**
 * Hook for monitoring the resizing event of the target element.
 *
 * @param target The target element or reference.
 * @param options See {@link UseSizeObserverOptions}.
 */
export function useSizeObserver(
  target: HTMLElement | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | null | undefined,
  handler: (element: HTMLElement) => void,
) {
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
  }, [target])
}
