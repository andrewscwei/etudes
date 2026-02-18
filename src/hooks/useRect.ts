import { type RefObject, useLayoutEffect, useState } from 'react'
import { Rect, Size } from 'spase'

import { useIntersectionObserver } from './useIntersectionObserver.js'
import { useSizeObserver } from './useSizeObserver.js'
import { useViewportSize } from './useViewportSize.js'

/**
 * Hook for monitoring changes in and returning the size and position of the
 * target element.
 *
 * @param target The target element or reference.
 *
 * @returns The most current {@link Rect} of the target element.
 */
export function useRect(target: HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined): Rect {
  const [rect, setRect] = useState<Rect>(Rect.zero)
  const viewportSize = useViewportSize()

  useSizeObserver(target, el => {
    const newRect = Rect.from(el)

    setRect(newRect)
  })

  useIntersectionObserver(target, el => {
    const newRect = Rect.from(el)

    setRect(newRect)
  })

  useLayoutEffect(() => {
    const element = target && 'current' in target ? target.current : target
    if (!element) return

    const newRect = Rect.from(element)

    setRect(newRect)
  }, [target, Size.toString(viewportSize)])

  return rect
}
