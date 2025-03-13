import { createContext, useContext, useEffect, useState, type PropsWithChildren, type RefObject } from 'react'
import { Point, Rect } from 'spase'

type ScrollPosition = {
  pos: Point
  step: Point
}

type ScrollPositionContextValue = ScrollPosition & {
  minPos: Point
  maxPos: Point
}

type ScrollPositionProviderProps = PropsWithChildren

export const ScrollPositionContext = /* #__PURE__ */ createContext<ScrollPositionContextValue | undefined>(undefined)

export function ScrollPositionProvider({
  children,
}: Readonly<ScrollPositionProviderProps>) {
  const [value, setValue] = useState<ScrollPositionContextValue>({
    minPos: Point.make(),
    maxPos: Point.make(),
    pos: Point.make(),
    step: Point.make(),
  })

  useEffect(() => {
    const updateScrollPosition = () => {
      const refRect = Rect.fromViewport()
      const refRectMin = refRect.clone({ x: 0, y: 0 })
      const refRectFull = Rect.from(window, { overflow: true })

      if (!refRectFull) return

      const refRectMax = refRectMin.clone({ x: refRectFull.width - refRect.width, y: refRectFull.height - refRect.height })
      const step = Point.make(refRect.left / refRectMax.left, refRect.top / refRectMax.top)

      setValue({
        minPos: Point.make(refRectMin.left, refRectMin.top),
        maxPos: Point.make(refRectMax.left, refRectMax.top),
        pos: Point.make(refRect.left, refRect.top),
        step,
      })
    }

    window.addEventListener('scroll', updateScrollPosition)
    window.addEventListener('resize', updateScrollPosition)
    window.addEventListener('orientationchange', updateScrollPosition)

    updateScrollPosition()

    return () => {
      window.removeEventListener('scroll', updateScrollPosition)
      window.removeEventListener('resize', updateScrollPosition)
      window.removeEventListener('orientationchange', updateScrollPosition)
    }
  }, [])

  return (
    <ScrollPositionContext.Provider value={value}>
      {children}
    </ScrollPositionContext.Provider>
  )
}

export function useScrollPosition(targetRef?: RefObject<Element> | RefObject<Element | undefined> | RefObject<Element | null>): ScrollPosition {
  const context = useContext(ScrollPositionContext)
  if (!context) throw Error('Cannot fetch the current scroll position context, is the corresponding provider instated?')

  if (!targetRef) {
    return {
      pos: context.pos,
      step: context.step,
    }
  }

  const element = targetRef.current

  const refRect = Rect.fromViewport()
  const rect = Rect.from(element)

  if (!refRect || !rect) {
    return {
      pos: Point.make(),
      step: Point.make(),
    }
  }

  const posX = refRect.right - rect.left
  const posY = refRect.bottom - rect.top
  const stepX = posX / rect.width
  const stepY = posY / rect.height

  return {
    pos: Point.make(posX, posY),
    step: Point.make(stepX, stepY),
  }
}
