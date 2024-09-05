import { useState, type RefObject } from 'react'
import { Rect, type Size } from 'spase'
import { useResizeEffect } from './useResizeEffect.js'

/**
 * Hook for monitoring changes in and returning the size of the target element.
 *
 * @param targetRef Reference to the target element.
 *
 * @returns The most current {@link Size} of the target element.
 */
export function useSize(targetRef: RefObject<HTMLElement>): Size {
  const [rect, setRect] = useState<Rect>(new Rect())

  const handleResize = (element: HTMLElement) => {
    const newRect = Rect.from(element)
    if (!newRect) return

    setRect(newRect)
  }

  useResizeEffect(targetRef, {
    onResize: element => handleResize(element),
  })

  return rect.size
}
