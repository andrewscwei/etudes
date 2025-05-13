import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren, type RefObject } from 'react'
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
 *
 * @exports ScrollPositionContext Context for providing scroll position
 *                                information.
 * @exports useScrollPosition Hook for accessing the current scroll position of
 *                            a target.
 */
export function ScrollPositionProvider({ children }: Readonly<ScrollPositionProviderProps>) {
  const isTickingRef = useRef(false)

  const [value, setValue] = useState<ScrollPositionContextValue>({
    minPos: Point.zero,
    maxPos: Point.zero,
    pos: Point.zero,
    step: Point.zero,
  })

  useEffect(() => {
    const handler = () => {
      const vrect = Rect.fromViewport()
      const refRectMin = Rect.clone(vrect, { x: 0, y: 0 })
      const refRectFull = Rect.from(window, { overflow: true })

      if (!refRectFull) return

      const refRectMax = Rect.clone(refRectMin, { x: refRectFull.width - vrect.width, y: refRectFull.height - vrect.height })
      const step = Point.make(vrect.left / refRectMax.left, vrect.top / refRectMax.top)

      setValue({
        minPos: Point.make(refRectMin.left, refRectMin.top),
        maxPos: Point.make(refRectMax.left, refRectMax.top),
        pos: Point.make(vrect.left, vrect.top),
        step,
      })
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

  if (!context) {
    console.error('Cannot fetch the current scroll position context, is the corresponding provider instated?')

    return {
      pos: Point.zero,
      step: Point.zero,
    }
  }

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
      pos: Point.zero,
      step: Point.zero,
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
