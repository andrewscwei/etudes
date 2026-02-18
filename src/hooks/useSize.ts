import { type RefObject, useState } from 'react'
import { Rect, Size } from 'spase'

import { useSizeObserver } from './useSizeObserver.js'

/**
 * Hook for monitoring changes in and returning the size of the target element.
 *
 * @param target Reference to the target element.
 *
 * @returns The most current {@link Size} of the target element.
 */
export function useSize(target: HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined): Size {
  const [size, setSize] = useState<Size>(Size.zero)

  useSizeObserver(target, el => {
    const rect = Rect.from(el)
    const newSize = Rect.size(rect)

    setSize(prev => Size.isEqual(prev, newSize) ? prev : newSize)
  })

  return size
}
