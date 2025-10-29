/**
 * Options for retrieving the computed style.
 */
type Options = {
  /**
   * Element from which to retrieve the computed style. If not provided, the
   * document's root element will be used.
   */
  element?: HTMLElement

  /**
   * Whether to retrieve the computed style. Defaults to `true`.
   */
  computed?: boolean
}

/**
 * Retrieves the style value of a CSS property from the specified element or the
 * document's root element if no element is provided. Option to get the computed
 * value.
 *
 * @param name Property name to retrieve, e.g., '--primary-color'. Note that the
 *             leading '--' is required for CSS custom properties.
 * @param options See {@link Options}.
 *
 * @returns The value of the CSS property, or `undefined` if the property does
 *          not exist.
 */
export function getStyle(name: string, { element, computed = true }: Options = {}): string | undefined {
  if (typeof window === 'undefined') return undefined

  const target = element ?? window.document.documentElement

  if (computed) {
    return window.getComputedStyle(target).getPropertyValue(name) || undefined
  }
  else {
    return target.style.getPropertyValue(name) || undefined
  }
}
