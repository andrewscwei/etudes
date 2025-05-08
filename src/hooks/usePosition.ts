import { useCallback, useEffect, useRef } from 'react'
import { Point, Rect } from 'spase'

export type ScrollPositionInfo = {
  minPos: Point
  maxPos: Point
  pos: Point
  step: Point
}

/**
 * Type describing the options of {@link usePosition}.
 */
export type UsePositionProps = {
  /**
   * Handler invoked when the scroll position changes.
   *
   * @param newInfo New scroll position information.
   * @param oldInfo Old scroll position information.
   */
  onChange: (newInfo: ScrollPositionInfo, oldInfo: ScrollPositionInfo | undefined) => void
}

/**
 * Hook for tracking the scroll position of the viewport.
 *
 * @param props See {@link UsePositionProps}.
 */
export function usePosition({ onChange }: UsePositionProps) {
  const scrollPositionChangeHandler = useCallback(() => {
    const newValue = getScrollPositionInfo()
    if (!newValue) return

    onChange(newValue, prevInfo.current)

    prevInfo.current = newValue
  }, [onChange])

  const prevInfo = useRef<ScrollPositionInfo>(undefined)

  useEffect(() => {
    window.addEventListener('scroll', scrollPositionChangeHandler)
    window.addEventListener('resize', scrollPositionChangeHandler)
    window.addEventListener('orientationchange', scrollPositionChangeHandler)

    scrollPositionChangeHandler()

    return () => {
      window.removeEventListener('scroll', scrollPositionChangeHandler)
      window.removeEventListener('resize', scrollPositionChangeHandler)
      window.removeEventListener('orientationchange', scrollPositionChangeHandler)
    }
  }, [scrollPositionChangeHandler])
}

const getScrollPositionInfo = (): ScrollPositionInfo | undefined => {
  const refRect = Rect.fromViewport()
  const refRectMin = refRect.clone({ x: 0, y: 0 })
  const refRectFull = Rect.from(window, { overflow: true })

  if (!refRectFull) return undefined

  const refRectMax = refRectMin.clone({ x: refRectFull.width - refRect.width, y: refRectFull.height - refRect.height })
  const step = Point.make(refRect.left / refRectMax.left, refRect.top / refRectMax.top)

  return {
    minPos: Point.make(refRectMin.left, refRectMin.top),
    maxPos: Point.make(refRectMax.left, refRectMax.top),
    pos: Point.make(refRect.left, refRect.top),
    step,
  }
}
