import { useState, type RefObject } from 'react'
import { Rect, Size } from 'spase'
import { useSizeObserver } from './useSizeObserver.js'

type TargetRef = RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>

/**
 * Hook for monitoring changes in and returning the size of the target element.
 *
 * @param targetRef Reference to the target element.
 *
 * @returns The most current {@link Size} of the target element.
 */
export function useSize(targetRef?: TargetRef): Size {
  const [size, setSize] = useState<Size>(Size.zero)

  useSizeObserver(targetRef, {
    onResize: element => {
      const rect = Rect.from(element)
      if (!rect) return

      const newSize = Rect.size(rect)

      setSize(prev => Size.isEqual(prev, newSize) ? prev : newSize)
    },
  })

  return size
}
