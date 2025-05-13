import { useState, type RefObject } from 'react'
import { Rect } from 'spase'
import { useSizeObserver } from './useSizeObserver.js'

type TargetRef = RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>

/**
 * Hook for monitoring changes in and returning the size and position of the
 * target element.
 *
 * @param targetRef Reference to the target element.
 *
 * @returns The most current {@link Rect} of the target element.
 */
export function useRect(targetRef: TargetRef): Rect {
  const [rect, setRect] = useState<Rect>(Rect.zero)

  useSizeObserver(targetRef, {
    onResize: element => {
      const newRect = Rect.from(element)
      if (!newRect) return

      setRect(newRect)
    },
  })

  return rect
}
