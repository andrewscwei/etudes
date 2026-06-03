import { createContext, type PropsWithChildren, type RefObject, use, useState } from 'react'
import { Point } from 'spase'

import { useScrollPositionObserver } from '../hooks/useScrollPositionObserver.js'

type Target = HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined

const initialContextValue: ContextValue = {
  current: Point.zero,
  end: Point.zero,
  progress: Point.zero,
  start: Point.zero,
}

type ContextValue = {
  current: Point.Point
  end: Point.Point
  progress: Point.Point
  start: Point.Point
}

type ProviderProps = PropsWithChildren<{
  scrollBottomOffset?: number
  scrollTopOffset?: number
  target?: Target
}>

/**
 * Provides information about the current scroll position of a scrollable area.
 */
const ScrollPositionContext = createContext(initialContextValue)

/**
 * Indicates whether the scroll position is at the top of the scrollable area.
 */
const ScrollTopContext = createContext(true)

/**
 * Indicates whether the scroll position is at the bottom of the scrollable
 * area.
 */
const ScrollBottomContext = createContext(false)

/**
 * Provides scroll position information to its descendants.
 */
export function ScrollPositionProvider({
  children,
  scrollBottomOffset = 0,
  scrollTopOffset = 0,
  target,
}: ProviderProps) {
  const [isScrollTop, setIsScrollTop] = useState(true)
  const [isScrollBottom, setIsScrollBottom] = useState(false)
  const [info, setInfo] = useState(initialContextValue)

  useScrollPositionObserver(target, newInfo => {
    setInfo(newInfo)
    setIsScrollTop(newInfo.current.y <= (newInfo.start.y + scrollTopOffset))
    setIsScrollBottom(newInfo.current.y >= (newInfo.end.y - scrollBottomOffset))
  })

  return (
    <ScrollTopContext.Provider value={isScrollTop}>
      <ScrollBottomContext.Provider value={isScrollBottom}>
        <ScrollPositionContext.Provider value={info}>
          {children}
        </ScrollPositionContext.Provider>
      </ScrollBottomContext.Provider>
    </ScrollTopContext.Provider>
  )
}

/**
 * Hook to determine if the scroll position is at the top of the scrollable
 * area.
 *
 * @returns `true` if the scroll position is at the top, `false` otherwise.
 */
export function useIsScrollTop() {
  const context = use(ScrollTopContext)
  if (context === undefined) {
    console.warn('[etudes::useIsScrollTop] `useIsScrollTop` must be used within a `ScrollPositionProvider`')
  }

  return context ?? true
}

/**
 * Hook to determine if the scroll position is at the bottom of the scrollable
 * area.
 *
 * @returns `true` if the scroll position is at the bottom, `false` otherwise.
 */
export function useIsScrollBottom() {
  const context = use(ScrollBottomContext)
  if (context === undefined) {
    console.warn('[etudes::useIsScrollBottom] `useIsScrollBottom` must be used within a `ScrollPositionProvider`')
  }

  return context ?? false
}

/**
 * Hook to access the current scroll position information from the nearest
 * `ScrollPositionProvider` in the component tree.
 *
 * @returns The current scroll position information, including the current
 *          scroll position. If the hook is used outside of a
 *          `ScrollPositionProvider`, it will return zero values.
 */
export function useScrollPosition() {
  const context = use(ScrollPositionContext)
  if (!context) {
    console.warn('[etudes::useScrollPosition] `useScrollPosition` must be used within a `ScrollPositionProvider`')
  }

  return context ?? {
    current: Point.zero,
    end: Point.zero,
    progress: Point.zero,
    start: Point.zero,
  }
}
