import { useEffect, useRef, type DependencyList } from 'react'
import { Point, Rect } from 'spase'

export type ScrollPositionInfo = {
  minPos: Point
  maxPos: Point
  pos: Point
  step: Point
}

type Props = {
  onChange: (newInfo: ScrollPositionInfo, oldInfo: ScrollPositionInfo | undefined) => void
}

export function usePosition({ onChange }: Props, deps: DependencyList = []) {
  const handleScrollPositionChange = () => {
    const newValue = getScrollPositionInfo()
    if (!newValue) return

    onChange(newValue, prevInfo.current)

    prevInfo.current = newValue
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

  const prevInfo = useRef<ScrollPositionInfo>(undefined)

  useEffect(() => {
    window.addEventListener('scroll', handleScrollPositionChange)
    window.addEventListener('resize', handleScrollPositionChange)
    window.addEventListener('orientationchange', handleScrollPositionChange)

    handleScrollPositionChange()

    return () => {
      window.removeEventListener('scroll', handleScrollPositionChange)
      window.removeEventListener('resize', handleScrollPositionChange)
      window.removeEventListener('orientationchange', handleScrollPositionChange)
    }
  }, [...deps])
}
