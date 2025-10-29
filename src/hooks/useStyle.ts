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
  element?: HTMLElement

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
export function useStyle(name: string, value?: string, { element, isEnabled = true }: Options = {}) {
  useLayoutEffect(() => {
    if (!isEnabled) return

    const target = element ?? window.document.documentElement
    const oldValue = getStyle(name, { element: target, computed: false })

    setStyle(name, value, { element: target })

    return () => {
      setStyle(name, oldValue, { element: target })
    }
  }, [name, value, element, isEnabled])
}
