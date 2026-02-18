import { type RefObject, useLayoutEffect } from 'react'

import { useLatest } from './useLatest.js'

type Target = HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined

type Options = {
  isEnabled?: boolean
}

/**
 * Hook for adding click outside interaction to an element.
 *
 * @param target The target element(s) or reference(s).
 * @param handler The handler to call when a click outside the target element is
 *                detected.
 * @param options See {@link Options}.
 */

export function useClickOutside(
  target: Target | Target[],
  handler: () => void,
  {
    isEnabled = true,
  }: Options = {},
) {
  const handlerRef = useLatest(handler)

  useLayoutEffect(() => {
    if (!isEnabled) return

    const listener = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return

      let isOutside = true
      let el = event.target

      const els = ([] as Target[]).concat(target).map(v => v && 'current' in v ? v.current : v).filter(Boolean)

      while (el) {
        if (els.find(t => t === el)) {
          isOutside = false
          break
        }

        if (!el.parentNode) break

        el = el.parentNode
      }

      if (!isOutside) return

      handlerRef.current()
    }

    window.addEventListener('click', listener, true)

    return () => {
      window.removeEventListener('click', listener, true)
    }
  }, [isEnabled, target])
}
