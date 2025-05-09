import { createContext, useContext, useEffect, useState, type PropsWithChildren, type RefObject } from 'react'
import { Point, Rect } from 'spase'

type TargetRef = RefObject<HTMLElement> | RefObject<HTMLElement | undefined> | RefObject<HTMLElement | null>

/**
 * Type describing the scroll position of a target element or the window.
 *
 * @param pos The current scroll position of the target element or the window.
 * @param step The fraction scrolled (0 - 1) in either axis.
 */
export type ScrollPosition = {
  pos: Point
  step: Point
}

/**
 * Type describing the value of {@link ScrollPositionContext}.
 */
export type ScrollPositionContextValue = ScrollPosition & {
  minPos: Point
  maxPos: Point
}

/**
 * Type describing the props of {@link ScrollPositionProvider}.
 */
export type ScrollPositionProviderProps = PropsWithChildren

/**
 * Context for providing scroll position information.
 */
export const ScrollPositionContext = /* #__PURE__ */ createContext<ScrollPositionContextValue | undefined>(undefined)

/**
 * A provider component that tracks the scroll position of the window and
 * provides it to its children via context.
 */
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
      const vrect = Rect.fromViewport()
      const refRectMin = vrect.clone({ x: 0, y: 0 })
      const refRectFull = Rect.from(window, { overflow: true })

      if (!refRectFull) return

      const refRectMax = refRectMin.clone({ x: refRectFull.width - vrect.width, y: refRectFull.height - vrect.height })
      const step = Point.make(vrect.left / refRectMax.left, vrect.top / refRectMax.top)

      setValue({
        minPos: Point.make(refRectMin.left, refRectMin.top),
        maxPos: Point.make(refRectMax.left, refRectMax.top),
        pos: Point.make(vrect.left, vrect.top),
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

/**
 * Hook for accessing the current scroll position of a target element or the
 * window.
 *
 * @param targetRef The reference to the target element to get the scroll
 *                  position of. If not provided, the scroll position of the
 *                  window will be returned.
 *
 * @returns The current scroll position of the target element or the window.
 */
export function useScrollPosition(targetRef?: TargetRef): ScrollPosition {
  const context = useContext(ScrollPositionContext)
  if (!context) throw Error('Cannot fetch the current scroll position context, is the corresponding provider instated?')

  if (!targetRef) {
    return {
      pos: context.pos,
      step: context.step,
    }
  }

  const element = targetRef.current
  const vrect = Rect.fromViewport()
  const rect = Rect.from(element)

  if (!vrect || !rect) {
    return {
      pos: Point.make(),
      step: Point.make(),
    }
  }

  const posX = vrect.right - rect.left
  const posY = vrect.bottom - rect.top
  const stepX = posX / rect.width
  const stepY = posY / rect.height

  return {
    pos: Point.make(posX, posY),
    step: Point.make(stepX, stepY),
  }
}

if (process.env.NODE_ENV !== 'production') {
  ScrollPositionProvider.displayName = 'ScrollPositionProvider'
}
