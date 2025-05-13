import { useEffect, useState } from 'react'
import { Rect, Size } from 'spase'

/**
 * Hook for returning the size of the viewport whenever it changes.
 *
 * @returns The most current viewport size.
 */
export function useViewportSize(): Size {
  const [size, setSize] = useState<Size>(Size.zero)

  useEffect(() => {
    const handler = () => {
      const viewportSize = Rect.size(Rect.fromViewport())
      setSize(viewportSize)
    }

    window.addEventListener('resize', handler)

    handler()

    return () => {
      window.removeEventListener('resize', handler)
    }
  }, [])

  return size
}
