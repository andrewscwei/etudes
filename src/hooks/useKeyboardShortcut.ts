import { type RefObject, useEffect } from 'react'

import { useLatest } from './useLatest.js'

type Target = HTMLElement | RefObject<HTMLElement | null | undefined | Window> | Window

type DigitKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

type LetterKey =
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm'
  | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'

type PunctuationKey =
  | '_' | '-' | ',' | ';' | ':' | '!' | '?' | '.' | '"' | '(' | ')'
  | '[' | ']' | '{' | '}' | '@' | '*' | '/' | '\\' | '&' | '#' | '%'
  | '`' | '^' | '+' | '<' | '=' | '>' | '|' | '~' | '$' | "'"

type FunctionKey =
  | 'f1' | 'f10' | 'f11' | 'f12' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8' | 'f9'

type ModifierKey = 'alt' | 'altgraph' | 'capslock' | 'control' | 'meta' | 'numlock' | 'scrolllock' | 'shift'

type NavigationKey = 'arrowdown' | 'arrowleft' | 'arrowright' | 'arrowup' | 'end' | 'home' | 'pagedown' | 'pageup'

type EditingKey = 'backspace' | 'delete' | 'enter' | 'insert' | 'space' | 'tab'

type UIKey = 'contextmenu' | 'escape' | 'pause' | 'printscreen'

type MediaKey =
  | 'audiovolumedown' | 'audiovolumemute' | 'audiovolumeup'
  | 'mediaplaypause' | 'mediastop' | 'mediatracknext' | 'mediatrackprevious'

/**
 * Type representing the keys that can be used in a keyboard shortcut.
 */
export type KeyboardKey =
  | DigitKey
  | EditingKey
  | FunctionKey
  | LetterKey
  | MediaKey
  | ModifierKey
  | NavigationKey
  | PunctuationKey
  | UIKey

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
  target?: Target
}

const KEY_ALIASES: Record<string, string> = {
  ' ': 'space',
  'apps': 'contextmenu',
  'del': 'delete',
  'down': 'arrowdown',
  'esc': 'escape',
  'left': 'arrowleft',
  'os': 'meta',
  'right': 'arrowright',
  'spacebar': 'space',
  'up': 'arrowup',
  'win': 'meta',
}

const CODE_TO_KEY: Record<string, string> = {
  Backquote: '`',
  Backslash: '\\',
  BracketLeft: '[',
  BracketRight: ']',
  Comma: ',',
  Equal: '=',
  Minus: '-',
  Period: '.',
  Quote: "'",
  Semicolon: ';',
  Slash: '/',
  Space: 'space',
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
  const keyList = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]
  const shortcutId = [...new Set(keyList.map(k => k.toLowerCase()))].sort().join('\u0000')

  useEffect(() => {
    if (!isEnabled || !shortcutId) return

    const eventTarget = target && 'current' in target ? target.current : target ?? window
    if (!eventTarget) return

    const requiredKeys = shortcutId.split('\u0000')

    const listener = (event: KeyboardEvent) => {
      if (event.isComposing || event.keyCode === 229) return

      const key = getKey(event)

      // Shift is implied by non-letter characters (Shift+/ yields '?'), so it
      // is ignored for those keys on both sides of the comparison.
      const ignoresShift = key.length === 1 && !/^[a-z]$/.test(key)

      const pressed = new Set<string>([key])

      if (event.ctrlKey) pressed.add('control')
      if (event.metaKey) pressed.add('meta')
      if (event.altKey) pressed.add('alt')
      if (event.shiftKey && !ignoresShift) pressed.add('shift')

      const required = ignoresShift ? requiredKeys.filter(k => k !== 'shift') : requiredKeys
      if (required.length !== pressed.size || !required.every(k => pressed.has(k))) return

      if (preventsDefault) event.preventDefault()
      if (stopsPropagation) event.stopPropagation()

      actionRef.current?.()
    }

    eventTarget.addEventListener('keydown', listener as EventListener, { capture })

    return () => {
      eventTarget.removeEventListener('keydown', listener as EventListener, { capture })
    }
  }, [shortcutId, isEnabled, preventsDefault, stopsPropagation, capture, target])
}

function keyFromCode(code: string): string | undefined {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase()
  if (/^Digit[0-9]$/.test(code)) return code.slice(5)

  return CODE_TO_KEY[code]
}

function getKey(event: KeyboardEvent): string {
  const raw = event.key.toLowerCase()
  const key = KEY_ALIASES[raw] ?? raw

  // Option+key on macOS produces composed characters (e.g. 'ß') or dead keys,
  // so fall back to the physical key.
  if (event.altKey && (key === 'dead' || (key.length === 1 && !/^[\x20-\x7E]$/.test(key)))) {
    return keyFromCode(event.code) ?? key
  }

  return key
}
