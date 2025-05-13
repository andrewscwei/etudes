import { useState, type RefObject } from 'react'
import { Rect, type Size } from 'spase'
import { useSizeObserver } from './useSizeObserver.js'

type TargetRef = RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>

/**
 * Hook for monitoring changes in and returning the size of the target element.
 *
 * @param targetRef Reference to the target element.
 *
 * @returns The most current {@link Size} of the target element.
 */
export function useSize(targetRef: TargetRef): Size {
  const [rect, setRect] = useState<Rect>(Rect.zero)

  useSizeObserver(targetRef, {
    onResize: element => {
      const newRect = Rect.from(element)
      if (!newRect) return

      setRect(newRect)
    },
  })

  return Rect.size(rect)
}
