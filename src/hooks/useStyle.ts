import { useLayoutEffect } from 'react'
import { getStyle } from '../utils/getStyle.js'
import { setStyle } from '../utils/setStyle.js'

/**
 * Type describing the options for {@link useStyle}.
 */
type Options = {
  /**
   * The target element to which the style will be applied, defaults to the
   * document's root element.
   */
  target?: HTMLElement

  /**
   * Specifies whether the hook is enabled, defaults to `true`.
   */
  isEnabled?: boolean
}

/**
 * Hook to apply a style string to an element, defaults to the document's root
 * element if no element is specified.
 *
 * @param name Property name to set, e.g., '--primary-color'. Note that the
 *             leading '--' is required for CSS custom properties.
 * @param value Value to set for the CSS property. If `undefined`, the property
 *              will be removed.
 * @param options See {@link Options}.
 */
export function useStyle(name: string, value?: string, { target, isEnabled = true }: Options = {}) {
  useLayoutEffect(() => {
    if (!isEnabled) return

    const el = target ?? window.document.documentElement
    const oldValue = getStyle(name, { target: el, computed: false })

    setStyle(name, value, { target: el })

    return () => {
      setStyle(name, oldValue, { target: el })
    }
  }, [name, value, target, isEnabled])
}
