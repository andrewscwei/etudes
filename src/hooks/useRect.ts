import { useState, type RefObject } from 'react'
import { Rect } from 'spase'
import { useSizeObserver } from './useSizeObserver.js'

/**
 * Hook for monitoring changes in and returning the size and position of the
 * target element.
 *
 * @param targetRef Reference to the target element.
 *
 * @returns The most current {@link Rect} of the target element.
 */
export function useRect(targetRef: RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>): Rect {
  const [rect, setRect] = useState<Rect>(Rect.make())

  const handleResize = (element: HTMLElement) => {
    const newRect = Rect.from(element)
    if (!newRect) return

    setRect(newRect)
  }

  useSizeObserver(targetRef, {
    onResize: element => handleResize(element),
  })

  return rect
}
