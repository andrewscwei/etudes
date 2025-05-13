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
  onResize: (element: HTMLElement) => void
}

/**
 * Hook for monitoring the resizing event of the target element.
 *
 * @param targetRef Reference to the target element.
 * @param options See {@link UseSizeObserverOptions}.
 */
export function useSizeObserver(targetRef: TargetRef, { onResize }: UseSizeObserverOptions) {
  const resizeHandlerRef = useRef(onResize)

  useEffect(() => {
    resizeHandlerRef.current = onResize
  }, [onResize])

  useEffect(() => {
    const element = targetRef.current
    if (!element) return

    const observer = new ResizeObserver(() => {
      resizeHandlerRef.current(element)
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [targetRef])
}
