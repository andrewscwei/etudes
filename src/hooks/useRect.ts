import { useLayoutEffect, useState, type RefObject } from 'react'
import { Rect, Size } from 'spase'
import { useIntersectionObserver } from './useIntersectionObserver.js'
import { useSizeObserver } from './useSizeObserver.js'
import { useViewportSize } from './useViewportSize.js'

type TargetRef = RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>

/**
 * Hook for monitoring changes in and returning the size and position of the
 * target element.
 *
 * @param targetRef Reference to the target element.
 *
 * @returns The most current {@link Rect} of the target element.
 */
export function useRect(targetRef?: TargetRef): Rect {
  const [rect, setRect] = useState<Rect>(Rect.zero)
  const viewportSize = useViewportSize()

  useSizeObserver(targetRef, {
    onResize: element => {
      const newRect = Rect.from(element)

      setRect(newRect)
    },
  })

  useIntersectionObserver(targetRef, {
    onChange: element => {
      const newRect = Rect.from(element)

      setRect(newRect)
    },
  })

  useLayoutEffect(() => {
    const element = targetRef?.current
    const newRect = Rect.from(element)

    setRect(newRect)
  }, [Size.toString(viewportSize)])

  return rect
}
