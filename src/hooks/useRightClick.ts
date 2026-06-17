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
 * @param targetRef The target to override. If undefined, the window will be
 *                  used.
 * @param action The function to invoke instead.
 * @param options See {@link Options}.
 */
export function useRightClick(targetRef: Target, action?: () => void, options?: Options): void

export function useRightClick(targetRefOrAction: (() => void) | Target, actionOrOptions?: (() => void) | Options, options: Options = {}) {
  const actionRef = useLatest(typeof targetRefOrAction === 'function'
    ? targetRefOrAction
    : typeof actionOrOptions === 'function'
      ? actionOrOptions
      : () => {})

  const target = typeof targetRefOrAction === 'function'
    ? undefined
    : targetRefOrAction && 'current' in targetRefOrAction
      ? targetRefOrAction.current
      : targetRefOrAction

  const { isEnabled = true } = typeof actionOrOptions === 'function' ? options : actionOrOptions ?? {}

  const isWindow = typeof targetRefOrAction === 'function'

  useEffect(() => {
    if (!isEnabled) return

    const listener = (e: MouseEvent) => {
      e.preventDefault()
      actionRef.current?.()
    }

    if (isWindow) {
      window.addEventListener('contextmenu', listener)

      return () => {
        window.removeEventListener('contextmenu', listener)
      }
    } else {
      target?.addEventListener('contextmenu', listener)

      return () => {
        target?.removeEventListener('contextmenu', listener)
      }
    }
  }, [isWindow, target, isEnabled])
}
