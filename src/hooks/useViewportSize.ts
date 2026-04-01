import { useLayoutEffect, useState } from 'react'
import { Rect, Size } from 'spase'

/**
 * Hook for returning the size of the viewport whenever it changes.
 *
 * @returns The most current viewport size.
 */
export function useViewportSize(): Size {
  const [size, setSize] = useState<Size>(Size.zero)

  useLayoutEffect(() => {
    const listener = () => {
      const viewportSize = Rect.size(Rect.fromViewport())
      setSize(prev => Size.isEqual(prev, viewportSize) ? prev : viewportSize)
    }

    window.addEventListener('resize', listener)

    listener()

    return () => {
      window.removeEventListener('resize', listener)
    }
  }, [])

  return size
}
