import { type RefObject, useLayoutEffect, useState } from 'react'
import { hitTest, Point, Rect } from 'spase'

import { useLatest } from './useLatest.js'

type Target = HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined

type Options = {
  isEnabled?: boolean
}

/**
 * Hook for determining if an element is hovered. Touch input is ignored since
 * it cannot hover.
 *
 * @param target The target element or reference to determine hover state for.
 * @param options See {@link Options}.
 *
 * @returns A boolean indicating whether the target element is hovered.
 */
export function useIsHovered(target: Target, { isEnabled = true }: Options = {}): boolean {
  const targetRef = useLatest(target)
  const [isHovered, setIsHovered] = useState(false)

  useLayoutEffect(() => {
    if (!isEnabled) return

    const listener = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return

      const t = targetRef.current
      const element = t && 'current' in t ? t.current : t
      if (!element) return

      const viewport = Rect.fromViewport()
      const point = Point.make([event.x + viewport.left, event.y + viewport.top])

      setIsHovered(hitTest(point, element))
    }

    window.addEventListener('pointermove', listener)

    return () => {
      window.removeEventListener('pointermove', listener)
    }
  }, [isEnabled])

  return isHovered
}
