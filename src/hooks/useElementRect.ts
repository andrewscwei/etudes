import { RefObject, useEffect, useRef, useState } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { Rect } from 'spase'

/**
 * Hook for monitoring changes in and returning the size and position of the target element.
 *
 * @param targetRef - Reference to the target element.
 *
 * @returns The most current {@link Rect} of the target element.
 */
export default function useElementRect(targetRef: RefObject<Element>): Rect {
  const observerRef = useRef<ResizeObserver | undefined>(undefined)
  const [rect, setRect] = useState<Rect>(new Rect())

  useEffect(() => {
    observerRef.current = new ResizeObserver(() => {
      const rect = Rect.from(targetRef.current)

      if (!rect) return

      setRect(rect)
    })

    if (observerRef.current && targetRef.current) {
      observerRef.current.observe(targetRef.current)
    }

    return () => {
      if (observerRef.current && targetRef.current) {
        observerRef.current.unobserve(targetRef.current)
      }
    }
  }, [targetRef])

  return rect
}
