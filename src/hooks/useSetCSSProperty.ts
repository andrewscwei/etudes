/**
 * Hook for setting a CSS property value on the window's root element.
 *
 * @param name Property name to set, e.g., '--primary-color'. Note that the
 *            leading '--' is required for CSS custom properties.
 * @param value Value to set for the CSS property. If `undefined`, the property
 *              will be removed.
 */
export function useSetCSSProperty(name: string, value?: string) {
  if (typeof window === 'undefined') return

  if (value === undefined) {
    window.document.documentElement.style.removeProperty(name)
  }
  else {
    window.document.documentElement.style.setProperty(name, value)
  }
}
