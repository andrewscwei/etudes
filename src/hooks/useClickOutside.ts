import { type RefObject, useEffect } from 'react'

import { useLatest } from './useLatest.js'

type Target = HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined

type Options = {
  isEnabled?: boolean
}

/**
 * Hook for adding click outside interaction to an element. Click outside is
 * detected when a pointer down event starts outside the target element. This
 * allows users to drag from inside the target element to outside of it without
 * triggering the click outside handler.
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
  const targetsRef = useLatest(([] as Target[]).concat(target))

  useEffect(() => {
    if (!isEnabled) return

    let isFromOutside = false

    const hitTest = (node: any) => {
      if (!(node instanceof Node)) return false

      const els = targetsRef.current
        .map(v => v && 'current' in v ? v.current : v)
        .filter(Boolean)

      return els.some(el => el?.contains(node))
    }

    const pointerDownListener = (event: PointerEvent) => {
      isFromOutside = !hitTest(event.target)
    }

    const clickListener = (event: MouseEvent) => {
      if (!isFromOutside || hitTest(event.target)) return

      isFromOutside = false
      handlerRef.current()
    }

    window.addEventListener('pointerdown', pointerDownListener, true)
    window.addEventListener('click', clickListener, true)

    return () => {
      window.removeEventListener('pointerdown', pointerDownListener, true)
      window.removeEventListener('click', clickListener, true)
    }
  }, [isEnabled])
}
