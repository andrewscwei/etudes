/**
 * Options for the setting the style value of a CSS property.
 */
type Options = {
  /**
   * Element on which to set the style. If not provided, the document's root
   * element will be used.
   */
  element?: HTMLElement
}

/**
 * Sets the style value of a CSS property on the specified element or the
 * document's root element if no element is provided. If the value is
 * `undefined`, the property will be removed.
 *
 * @param name Property name to set, e.g., '--primary-color'. Note that the
 *             leading '--' is required for CSS custom properties.
 * @param value Value to set for the CSS property. If `undefined`, the property
 *              will be removed.
 * @param options See {@link Options}.
 */
export function setStyle(name: string, value?: string, { element }: Options = {}) {
  if (typeof window === 'undefined') return

  const target = element ?? window.document.documentElement

  if (value === undefined) {
    target.style.removeProperty(name)
  }
  else {
    target.style.setProperty(name, value)
  }
}
