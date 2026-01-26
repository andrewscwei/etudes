import { useLayoutEffect, type RefObject } from 'react'
import { Point, Rect, hitTest } from 'spase'
import { useLatest } from './useLatest.js'

type Options = {
  isEnabled?: boolean
}

/**
 * Hook for adding mouse leave interaction to an element.
 *
 * @param target The target element or reference to add mouse leave interaction
 *               to.
 * @param handler The handler to call when a mouse leave from the target element
 *                is detected.
 * @param options See {@link Options}.
 */
export function useMouseLeave(
  target: HTMLElement | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | null | undefined,
  handler: () => void,
  {
    isEnabled = true,
  }: Options = {},
) {
  const handlerRef = useLatest(handler)

  useLayoutEffect(() => {
    if (!isEnabled) return

    const listener = (event: MouseEvent) => {
      const viewport = Rect.fromViewport()
      const point = Point.make([event.x + viewport.left, event.y + viewport.top])
      const element = target && 'current' in target ? target.current : target

      if (element && !hitTest(point, element)) {
        handlerRef.current()
      }
    }

    window.addEventListener('mousemove', listener)

    return () => {
      window.removeEventListener('mousemove', listener)
    }
  }, [isEnabled, target])
}
