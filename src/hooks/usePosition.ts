import { useLayoutEffect, useRef, type DependencyList } from 'react'
import { Point, Rect } from 'spase'
import { useLatest } from './useLatest.js'

export type ScrollPositionInfo = {
  minPos: Point
  maxPos: Point
  pos: Point
  step: Point
}

/**
 * Hook for tracking the scroll position of the viewport.
 *
 * @param onChange Handler invoked when the scroll position changes.
 * @param deps Optional dependency list to control when the hook should re-run.
 */
export function usePosition(
  onChange: (newInfo: ScrollPositionInfo, oldInfo: ScrollPositionInfo | undefined) => void,
  deps: DependencyList = [],
) {
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
  }, [...deps])
}

function _getScrollPositionInfo(): ScrollPositionInfo | undefined {
  const refRect = Rect.fromViewport()
  const refRectMin = Rect.clone(refRect, { x: 0, y: 0 })
  const refRectFull = Rect.from(window, { overflow: true })

  const refRectMax = Rect.clone(refRectMin, { x: refRectFull.width - refRect.width, y: refRectFull.height - refRect.height })
  const step = Point.make(refRect.left / refRectMax.left, refRect.top / refRectMax.top)

  return {
    minPos: Point.make(refRectMin.left, refRectMin.top),
    maxPos: Point.make(refRectMax.left, refRectMax.top),
    pos: Point.make(refRect.left, refRect.top),
    step,
  }
}
