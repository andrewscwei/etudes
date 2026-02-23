import { type KeyboardEvent, type RefObject, useEffect, useMemo } from 'react'

import { useLatest } from './useLatest.js'

/**
 * A type representing the keys that can be used in a keyboard shortcut.
 */
export type KeyboardKey =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'a'
  | 'alt'
  | 'arrowdown'
  | 'arrowleft'
  | 'arrowright'
  | 'arrowup'
  | 'audiovolumedown'
  | 'audiovolumemute'
  | 'audiovolumeup'
  | 'b'
  | 'backspace'
  | 'c'
  | 'capslock'
  | 'contextmenu'
  | 'control'
  | 'd'
  | 'delete'
  | 'e'
  | 'end'
  | 'enter'
  | 'escape'
  | 'f'
  | 'f1'
  | 'f10'
  | 'f11'
  | 'f12'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8'
  | 'f9'
  | 'g'
  | 'h'
  | 'home'
  | 'i'
  | 'insert'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'mediaplaypause'
  | 'mediastop'
  | 'mediatracknext'
  | 'mediatrackprevious'
  | 'meta'
  | 'n'
  | 'numlock'
  | 'o'
  | 'p'
  | 'pagedown'
  | 'pageup'
  | 'pause'
  | 'printscreen'
  | 'q'
  | 'r'
  | 's'
  | 'scrolllock'
  | 'shift'
  | 'space'
  | 't'
  | 'tab'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'

/**
 * Options for the {@link useKeyboardShortcut} hook.
 */
type Options = {
  /**
   * Specifies whether to use event capturing.
   */
  capture?: boolean

  /**
   * Specifies whether the keyboard shortcut is enabled.
   */
  isEnabled?: boolean

  /**
   * Specifies whether to prevent the default action for the keyboard event.
   */
  preventsDefault?: boolean

  /**
   * Specifies whether to stop propagation of the keyboard event.
   */
  stopsPropagation?: boolean

  /**
   * The target element to attach the event listener to. Defaults to `window`.
   */
  target?: HTMLElement | RefObject<HTMLElement | null | Window> | RefObject<HTMLElement | undefined | Window> | RefObject<HTMLElement | Window> | Window
}

/**
 * A hook that listens for a keyboard shortcut and triggers an action.
 *
 * @param keyOrKeys The key or keys that make up the keyboard shortcut.
 * @param action The action to trigger when the key is pressed.
 * @param options See {@link Options}.
 */
export function useKeyboardShortcut(
  keyOrKeys: KeyboardKey | KeyboardKey[],
  action: () => void,
  {
    capture = false,
    preventsDefault = true,
    stopsPropagation = true,
    target,
    isEnabled = true,
  }: Options = {},
) {
  const actionRef = useLatest(action)
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]
  const normalizedKeys = useMemo(() => keys.map(k => k.toLowerCase()).sort(), [keys.join(',')])

  useEffect(() => {
    if (!isEnabled || normalizedKeys.length === 0) return

    const eventTarget = target && typeof target === 'object' && 'current' in target
      ? target.current
      : target || window

    if (!eventTarget) return

    const listener = (event: KeyboardEvent) => {
      const pressed = new Set([
        event.key.toLowerCase(),
        event.ctrlKey && 'control',
        event.metaKey && 'meta',
        event.shiftKey && 'shift',
        event.altKey && 'alt',
      ].filter(Boolean))

      const match = normalizedKeys.every(k => pressed.has(k)) && pressed.size === normalizedKeys.length

      if (!match) return

      if (preventsDefault) {
        event.preventDefault()
      }

      if (stopsPropagation) {
        event.stopPropagation()
      }

      actionRef.current?.()
    }

    eventTarget.addEventListener('keydown', listener as any, { capture })

    return () => {
      eventTarget.removeEventListener('keydown', listener as any, { capture })
    }
  }, [isEnabled, preventsDefault, stopsPropagation, capture, normalizedKeys.join(',')])
}
