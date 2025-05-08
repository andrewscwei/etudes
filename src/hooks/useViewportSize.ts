import { useCallback, useEffect, useState } from 'react'
import { Rect, Size } from 'spase'

/**
 * Hook for returning the size of the viewport whenever it changes.
 *
 * @returns The most current viewport size.
 */
export function useViewportSize(): Size {
  const [size, setSize] = useState<Size>(Size.make())

  const resizeHandler = useCallback(() => {
    const viewportSize = Rect.fromViewport().size
    setSize(viewportSize)
  }, [])

  useEffect(() => {
    window.addEventListener('resize', resizeHandler)

    resizeHandler()

    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [resizeHandler])

  return size
}
