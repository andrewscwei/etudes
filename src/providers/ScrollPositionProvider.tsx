import { createContext, type PropsWithChildren, type RefObject, use, useState } from 'react'
import { type Point } from 'spase'

import { useScrollPositionObserver } from '../hooks/useScrollPositionObserver.js'

type Target = HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined

type ContextValue = {
  current: Point.Point
  end: Point.Point
  progress: Point.Point
  start: Point.Point
}

type ProviderProps = PropsWithChildren<{
  target?: Target
}>

/**
 * Provides information about the current scroll position of a scrollable area.
 */
const ScrollPositionContext = createContext<ContextValue | undefined>(undefined)

/**
 * Indicates whether the scroll position is at the top of the scrollable area.
 */
const ScrollTopContext = createContext<boolean | undefined>(undefined)

/**
 * Indicates whether the scroll position is at the bottom of the scrollable
 * area.
 */
const ScrollBottomContext = createContext<boolean | undefined>(undefined)

/**
 * Provides scroll position information to its descendants.
 */
export function ScrollPositionProvider({
  children,
  target,
}: ProviderProps) {
  const [isScrollTop, setIsScrollTop] = useState<boolean | undefined>()
  const [isScrollBottom, setIsScrollBottom] = useState<boolean | undefined>()
  const [info, setInfo] = useState<ContextValue | undefined>()

  useScrollPositionObserver(target, newInfo => {
    setInfo(newInfo)
    setIsScrollTop(newInfo.current.y <= newInfo.start.y)
    setIsScrollBottom(newInfo.current.y >= newInfo.end.y)
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

  return context
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

  return context
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

  return context
}
