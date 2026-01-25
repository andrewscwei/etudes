import { useCallback, useEffect, type RefObject } from 'react'
import { Point, Rect, hitTest } from 'spase'

type TargetRef = RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>

type Options = {
  isEnabled?: boolean
}

/**
 * Hook for adding mouse enter interaction to an element.
 *
 * @param targetRef The reference to the target element to add mouse enter
 *                  interaction to.
 * @param handler The handler to call when a mouse enter to the target element
 *                is detected.
 * @param options See {@link Options}.
 */
export function useMouseEnter(targetRef: TargetRef, handler: () => void, {
  isEnabled = true,
}: Options = {}) {
  const listener = useCallback((event: MouseEvent) => {
    const viewport = Rect.fromViewport()
    const point = Point.make([event.x + viewport.left, event.y + viewport.top])
    const target = targetRef.current

    if (isEnabled && target && hitTest(point, target)) {
      handler()
    }
  }, [isEnabled])

  useEffect(() => {
    window.addEventListener('mousemove', listener)

    return () => {
      window.removeEventListener('mousemove', listener)
    }
  }, [listener])
}
