import { type RefObject, useState } from 'react'

import { isTouchDevice } from '../utils/isTouchDevice.js'
import { useMouseEnter } from './useMouseEnter.js'
import { useMouseLeave } from './useMouseLeave.js'

type Target = HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined

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
export function useIsHovered(target: Target, { isEnabled = true }: Options = {}): boolean {
  const isTouch = isTouchDevice()
  const [isHovered, setIsHovered] = useState(false)

  useMouseEnter(target, () => {
    setIsHovered(true)
  }, { isEnabled: !isTouch && isEnabled })

  useMouseLeave(target, () => {
    setIsHovered(false)
  }, { isEnabled: !isTouch && isEnabled })

  return isHovered
}
