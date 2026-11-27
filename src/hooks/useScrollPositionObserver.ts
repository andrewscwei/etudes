import { type DependencyList, type RefObject, useLayoutEffect, useRef, useState } from 'react'
import { Point } from 'spase'

import { useLatest } from './useLatest.js'

export type ScrollPositionInfo = {
  current: Point.Point
  end: Point.Point
  progress: Point.Point
  start: Point.Point
}

type Target = HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined

type ChangeHandler = (newInfo: ScrollPositionInfo, oldInfo: ScrollPositionInfo | undefined) => void

/**
 * Hook for tracking the scroll position of a target element or the viewport.
 *
 * @param target Optional target element or ref to track. If `undefined`, the
 *               viewport is tracked instead. If `null` (or a ref that is not
 *               yet populated), nothing is tracked until the element mounts.
 * @param onChange Handler invoked when the scroll position changes.
 * @param deps Optional dependency list to control when the hook should re-run.
 */
export function useScrollPositionObserver(
  target: Target,
  onChange: ChangeHandler,
  deps?: DependencyList,
): void

/**
 * Hook for tracking the scroll position of the viewport.
 *
 * @param onChange Handler invoked when the scroll position changes.
 * @param deps Optional dependency list to control when the hook should re-run.
 */
export function useScrollPositionObserver(
  onChange: ChangeHandler,
  deps?: DependencyList,
): void

export function useScrollPositionObserver(
  ...args: | [ChangeHandler, DependencyList?] | [Target, ChangeHandler, DependencyList?]
) {
  const target = typeof args[0] === 'function' ? undefined : args[0]
  const onChange = typeof args[0] === 'function' ? args[0] : args[1] as (newInfo: ScrollPositionInfo, oldInfo: ScrollPositionInfo | undefined) => void
  const deps = typeof args[0] === 'function' ? (args[1] as DependencyList | undefined) ?? [] : (args[2] as DependencyList | undefined) ?? []

  const changeHandlerRef = useLatest(onChange)
  const prevInfoRef = useRef<ScrollPositionInfo>(undefined)
  const prevScrollTargetRef = useRef<HTMLElement | Window>(undefined)

  const [scrollTarget, setScrollTarget] = useState<HTMLElement | undefined | Window>()

  useLayoutEffect(() => {
    setScrollTarget(_resolveScrollTarget(target))
  })

  useLayoutEffect(() => {
    if (!scrollTarget) return

    if (prevScrollTargetRef.current !== scrollTarget) {
      prevInfoRef.current = undefined
      prevScrollTargetRef.current = scrollTarget
    }

    let frameId: number | undefined

    const handler = () => {
      const newInfo = scrollTarget instanceof HTMLElement ? _getElementScrollPositionInfo(scrollTarget) : _getViewportScrollPositionInfo()
      if (!newInfo) return

      changeHandlerRef.current(newInfo, prevInfoRef.current)
      prevInfoRef.current = newInfo
    }

    const tick = () => {
      if (frameId !== undefined) return
      if (typeof requestAnimationFrame !== 'function') return

      frameId = requestAnimationFrame(() => {
        frameId = undefined
        handler()
      })
    }

    scrollTarget.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick)
    window.addEventListener('orientationchange', tick)

    tick()

    return () => {
      if (frameId !== undefined) cancelAnimationFrame(frameId)

      scrollTarget.removeEventListener('scroll', tick)
      window.removeEventListener('resize', tick)
      window.removeEventListener('orientationchange', tick)
    }
  }, [scrollTarget, ...deps])
}

function _resolveScrollTarget(target: Target): HTMLElement | undefined | Window {
  if (target === undefined) return window
  if (target === null) return undefined
  if (target instanceof HTMLElement) return target

  return target.current ?? undefined
}

function _getViewportScrollPositionInfo(): ScrollPositionInfo | undefined {
  const scrollLeft = window.scrollX
  const scrollTop = window.scrollY
  const maxScrollLeft = document.documentElement.scrollWidth - window.innerWidth
  const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight

  return {
    current: Point.make(scrollLeft, scrollTop),
    end: Point.make(maxScrollLeft, maxScrollTop),
    progress: Point.make(maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0, maxScrollTop > 0 ? scrollTop / maxScrollTop : 0),
    start: Point.make(0, 0),
  }
}

function _getElementScrollPositionInfo(element: HTMLElement): ScrollPositionInfo | undefined {
  const scrollLeft = element.scrollLeft
  const scrollTop = element.scrollTop
  const maxScrollLeft = element.scrollWidth - element.clientWidth
  const maxScrollTop = element.scrollHeight - element.clientHeight

  return {
    current: Point.make(scrollLeft, scrollTop),
    end: Point.make(maxScrollLeft, maxScrollTop),
    progress: Point.make(maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0, maxScrollTop > 0 ? scrollTop / maxScrollTop : 0),
    start: Point.make(0, 0),
  }
}
