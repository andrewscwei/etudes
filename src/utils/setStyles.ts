import { type CSSProperties } from 'react'

/**
 * Options for the setting the styles of an HTML element.
 */
type Options = {
  /**
   * Element on which to set the style. If not provided, the document's root
   * element will be used.
   */
  target?: HTMLElement
}

/**
 * Sets the styles of an HTML element. If no element is provided, the styles
 * will be set on the document's root element.
 *
 * @param styles An object containing the CSS properties and their corresponding
 *               values to set.
 * @param options See {@link Options}.
 */
export function setStyles(styles: CSSProperties, { target }: Options = {}) {
  if (typeof window === 'undefined') return

  const el = target ?? window.document.documentElement

  Object
    .keys(styles)
    .forEach(rule => {
      (el.style as any)[rule] = (styles as any)[rule]
    })
}
