/**
 * Sets a CSS property on the window's root element.
 *
 * @param name Property name to set, e.g., '--primary-color'. Note that the
 *             leading '--' is required for CSS custom properties.
 * @param value Value to set for the CSS property. If `undefined`, the property
 *              will be removed.
 */
type SetCSSProperty = (name: string, value?: string) => void

/**
 * Hook for returning a function that sets a CSS property value on the window's
 * root element.
 *
 * @returns Function that sets a CSS property on the window's root element.
 */
export function useSetCSSProperty(): SetCSSProperty {
  return (name: string, value?: string) => {
    if (typeof window === 'undefined') return

    if (value === undefined) {
      window.document.documentElement.style.removeProperty(name)
    }
    else {
      window.document.documentElement.style.setProperty(name, value)
    }
  }
}
