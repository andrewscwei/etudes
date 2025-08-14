/**
 * Hook for retrieving a CSS property value from the window's computed style.
 *
 * @param name Property name to retrieve, e.g., '--primary-color'. Note that the
 *             leading '--' is required for CSS custom properties.
 *
 * @returns The value of the CSS property, or `undefined` if the property does
 *          not exist.
 */
export function useCSSProperty(name: string): string | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const computedStyle = window.getComputedStyle(window.document.documentElement)

  return computedStyle.getPropertyValue(name) || undefined
}
