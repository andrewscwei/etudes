import { useEffect, useState } from 'react'
import { Rect, Size } from 'spase'

/**
 * Hook for returning the size of the viewport whenever it changes.
 *
 * @returns The most current viewport size.
 */
export default function useViewportSize() {
  const [size, setSize] = useState<Size>(new Size())

  useEffect(() => {
    function onViewportResize() {
      const viewportSize = Rect.fromViewport().size
      setSize(viewportSize)
    }

    window.addEventListener('resize', onViewportResize)

    onViewportResize()

    return () => window.removeEventListener('resize', onViewportResize)
  }, [])

  return size
}
