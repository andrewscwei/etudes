import { useLayoutEffect, useRef } from 'react'
import { Point, Rect } from 'spase'
import { useLatest } from './useLatest.js'

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
  const changeHandlerRef = useLatest(onChange)
  const prevInfoRef = useRef<ScrollPositionInfo>(undefined)
  const isTickingRef = useRef(false)

  useLayoutEffect(() => {
    const handler = () => {
      const newInfo = _getScrollPositionInfo()
      if (!newInfo) return

      changeHandlerRef.current(newInfo, prevInfoRef.current)
      prevInfoRef.current = newInfo
    }

    const tick = () => {
      if (isTickingRef.current) return
      if (typeof requestAnimationFrame !== 'function') return

      isTickingRef.current = true

      requestAnimationFrame(() => {
        handler()
        isTickingRef.current = false
      })
    }

    window.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick)
    window.addEventListener('orientationchange', tick)

    tick()

    return () => {
      window.removeEventListener('scroll', tick)
      window.removeEventListener('resize', tick)
      window.removeEventListener('orientationchange', tick)
    }
  }, [])
}

function _getScrollPositionInfo(): ScrollPositionInfo | undefined {
  const refRect = Rect.fromViewport()
  const refRectMin = Rect.clone(refRect, { x: 0, y: 0 })
  const refRectFull = Rect.from(window, { overflow: true })

  if (!refRectFull) return undefined

  const refRectMax = Rect.clone(refRectMin, { x: refRectFull.width - refRect.width, y: refRectFull.height - refRect.height })
  const step = Point.make(refRect.left / refRectMax.left, refRect.top / refRectMax.top)

  return {
    minPos: Point.make(refRectMin.left, refRectMin.top),
    maxPos: Point.make(refRectMax.left, refRectMax.top),
    pos: Point.make(refRect.left, refRect.top),
    step,
  }
}
