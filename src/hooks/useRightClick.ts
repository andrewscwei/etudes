import { type RefObject, useEffect } from 'react'

import { useLatest } from './useLatest.js'

type Target = HTMLElement | null | RefObject<HTMLElement> | RefObject<HTMLElement | null> | RefObject<HTMLElement | undefined> | undefined

type Options = {
  isEnabled?: boolean
}

/**
 * Hook for overriding the browser-default right click context menu action on
 * the window.
 *
 * @param action The function to invoke instead.
 * @param options See {@link Options}.
 */
export function useRightClick(action: () => void, options?: Options): void

/**
 * Hook for overriding the browser-default right click context menu action for
 * an element.
 *
 * @param target The target to override. If undefined, the window will be used.
 * @param action The function to invoke instead.
 * @param options See {@link Options}.
 */
export function useRightClick(target: Target, action?: () => void, options?: Options): void

export function useRightClick(targetOrAction: (() => void) | Target, actionOrOptions?: (() => void) | Options, options: Options = {}) {
  const actionRef = useLatest(typeof targetOrAction === 'function'
    ? targetOrAction
    : typeof actionOrOptions === 'function'
      ? actionOrOptions
      : () => {})

  const target = typeof targetOrAction === 'function'
    ? undefined
    : targetOrAction

  const { isEnabled = true } = typeof actionOrOptions === 'function' ? options : actionOrOptions ?? {}

  const isWindow = typeof targetOrAction === 'function'

  useEffect(() => {
    if (!isEnabled) return

    if (isWindow) {
      const listener = (e: MouseEvent) => {
        e.preventDefault()
        actionRef.current?.()
      }

      window.addEventListener('contextmenu', listener)

      return () => {
        window.removeEventListener('contextmenu', listener)
      }
    } else {
      const element = target && 'current' in target ? target.current : target

      const listener = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        actionRef.current?.()
      }

      element?.addEventListener('contextmenu', listener)

      return () => {
        element?.removeEventListener('contextmenu', listener)
      }
    }
  }, [isWindow, target && 'current' in target ? target.current : target, isEnabled])
}
