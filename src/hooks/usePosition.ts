import { type DependencyList, type RefObject, useLayoutEffect, useRef } from 'react'
import { Point } from 'spase'

import { useLatest } from './useLatest.js'

export type ScrollPositionInfo = {
  maxPos: Point
  minPos: Point
  pos: Point
  step: Point
}

type Target = HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined

/**
 * Hook for tracking the scroll position of a target element or the viewport.
 *
 * @param target Optional target element or ref to track. If not provided, the
 *               viewport is tracked instead.
 * @param onChange Handler invoked when the scroll position changes.
 * @param deps Optional dependency list to control when the hook should re-run.
 */
export function usePosition(
  target: Target,
  onChange: (newInfo: ScrollPositionInfo, oldInfo: ScrollPositionInfo | undefined) => void,
  deps?: DependencyList,
): void
export function usePosition(
  onChange: (newInfo: ScrollPositionInfo, oldInfo: ScrollPositionInfo | undefined) => void,
  deps?: DependencyList,
): void
export function usePosition(...args:
  | [(newInfo: ScrollPositionInfo, oldInfo: ScrollPositionInfo | undefined) => void, DependencyList?]
  | [Target, (newInfo: ScrollPositionInfo, oldInfo: ScrollPositionInfo | undefined) => void, DependencyList?]) {
  const target = typeof args[0] === 'function' ? undefined : args[0]
  const onChange = typeof args[0] === 'function' ? args[0] : args[1] as (newInfo: ScrollPositionInfo, oldInfo: ScrollPositionInfo | undefined) => void
  const deps = typeof args[0] === 'function' ? (args[1] as DependencyList | undefined) ?? [] : (args[2] as DependencyList | undefined) ?? []

  const changeHandlerRef = useLatest(onChange)
  const prevInfoRef = useRef<ScrollPositionInfo>(undefined)
  const isTickingRef = useRef(false)

  useLayoutEffect(() => {
    const el = _resolveTarget(target)

    const handler = () => {
      const newInfo = el ? _getElementScrollPositionInfo(el) : _getViewportScrollPositionInfo()
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

    const scrollTarget = el ?? window

    scrollTarget.addEventListener('scroll', tick, { passive: true })
    window.addEventListener('resize', tick)
    window.addEventListener('orientationchange', tick)

    tick()

    return () => {
      scrollTarget.removeEventListener('scroll', tick)
      window.removeEventListener('resize', tick)
      window.removeEventListener('orientationchange', tick)
    }
  }, [...deps])
}

function _resolveTarget(target: Target): HTMLElement | undefined {
  if (target == null) return undefined
  if (target instanceof HTMLElement) return target

  return target.current ?? undefined
}

function _getViewportScrollPositionInfo(): ScrollPositionInfo | undefined {
  const scrollLeft = window.scrollX
  const scrollTop = window.scrollY
  const maxScrollLeft = document.documentElement.scrollWidth - window.innerWidth
  const maxScrollTop = document.documentElement.scrollHeight - window.innerHeight

  return {
    maxPos: Point.make(maxScrollLeft, maxScrollTop),
    minPos: Point.make(0, 0),
    pos: Point.make(scrollLeft, scrollTop),
    step: Point.make(maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0, maxScrollTop > 0 ? scrollTop / maxScrollTop : 0),
  }
}

function _getElementScrollPositionInfo(element: HTMLElement): ScrollPositionInfo | undefined {
  const scrollLeft = element.scrollLeft
  const scrollTop = element.scrollTop
  const maxScrollLeft = element.scrollWidth - element.clientWidth
  const maxScrollTop = element.scrollHeight - element.clientHeight

  return {
    maxPos: Point.make(maxScrollLeft, maxScrollTop),
    minPos: Point.make(0, 0),
    pos: Point.make(scrollLeft, scrollTop),
    step: Point.make(maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0, maxScrollTop > 0 ? scrollTop / maxScrollTop : 0),
  }
}
