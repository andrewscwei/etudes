import { useLayoutEffect } from 'react'

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
 * Hook to apply a style string to the document's root element.
 *
 * @param style The CSS style string to apply to an element, defaults to the
 *              document's root element if no element is specified.
 * @param options See {@link Options}.
 */
export function useStyle(style: string, { element, isEnabled = true }: Options = {}) {
  useLayoutEffect(() => {
    if (!isEnabled) return

    const target = element ?? window.document.documentElement
    const oldValue = target.getAttribute('style') || ''

    target.style = style

    return () => {
      target.style = oldValue
    }
  }, [style, element, isEnabled])
}
