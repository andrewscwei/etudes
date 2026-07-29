import { type RefObject, useEffect, useState } from 'react'

import { isTouchDevice } from '../utils/isTouchDevice.js'
import { useMouseLeave } from './useMouseLeave.js'

type Options = {
  isEnabled?: boolean
}

/**
 * Hook for determining if an element is hovered.
 *
 * @param target The target element or reference to determine hover state for.
 * @param options See {@link Options}.
 *
 * @returns A boolean indicating whether the target element is hovered.
 */
export function useIsHovered(
  target: HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined,
  {
    isEnabled = true,
  }: Options = {},
): boolean {
  const isTouch = isTouchDevice()
  const [isHovered, setIsHovered] = useState(false)

  const el = target && 'current' in target ? target.current : target

  useEffect(() => {
    if (isTouch || !isEnabled || !el) {
      setIsHovered(false)

      return
    }

    const handler = () => setIsHovered(true)

    el.addEventListener('pointerover', handler)

    return () => {
      el.removeEventListener('pointerover', handler)
    }
  }, [el, isEnabled, isTouch])

  useMouseLeave(target, () => {
    setIsHovered(false)
  }, { isEnabled: !isTouch && isEnabled })

  return isHovered
}
