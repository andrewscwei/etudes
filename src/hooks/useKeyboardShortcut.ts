import { type KeyboardEvent, type RefObject, useEffect, useMemo } from 'react'
import { useLatest } from './useLatest.js'

/**
 * A type representing the keys that can be used in a keyboard shortcut.
 */
export type KeyboardKey =
  | 'backspace'
  | 'tab'
  | 'enter'
  | 'shift'
  | 'control'
  | 'alt'
  | 'pause'
  | 'capslock'
  | 'escape'
  | 'space'
  | 'pageup'
  | 'pagedown'
  | 'end'
  | 'home'
  | 'arrowleft'
  | 'arrowup'
  | 'arrowright'
  | 'arrowdown'
  | 'printscreen'
  | 'insert'
  | 'delete'
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
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'
  | 'meta'
  | 'contextmenu'
  | 'f1'
  | 'f2'
  | 'f3'
  | 'f4'
  | 'f5'
  | 'f6'
  | 'f7'
  | 'f8'
  | 'f9'
  | 'f10'
  | 'f11'
  | 'f12'
  | 'numlock'
  | 'scrolllock'
  | 'audiovolumemute'
  | 'audiovolumedown'
  | 'audiovolumeup'
  | 'mediatracknext'
  | 'mediatrackprevious'
  | 'mediastop'
  | 'mediaplaypause'

/**
 * Options for the {@link useKeyboardShortcut} hook.
 */
type Options = {
  /**
   * Specifies whether the keyboard shortcut is enabled.
   */
  isEnabled?: boolean

  /**
   * Specifies whether to prevent the default action for the keyboard event.
   */
  preventDefault?: boolean

  /**
   * Specifies whether to use event capturing.
   */
  capture?: boolean

  /**
   * The target element to attach the event listener to. Defaults to `window`.
   */
  target?: Window | HTMLElement | RefObject<Window | HTMLElement> | RefObject<Window | HTMLElement | null> | RefObject<Window | HTMLElement | undefined>
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
    isEnabled = true,
    preventDefault = true,
    capture = true,
    target,
  }: Options = {},
) {
  const actionRef = useLatest(action)
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]
  const normalizedKeys = useMemo(() => keys.map(k => k.toLowerCase()).sort(), [keys])

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

      if (preventDefault) {
        event.preventDefault()
      }

      actionRef.current?.()
    }

    eventTarget.addEventListener('keydown', listener as any, { capture })

    return () => {
      eventTarget.removeEventListener('keydown', listener as any, { capture })
    }
  }, [isEnabled, preventDefault, capture, normalizedKeys.join(',')])
}
