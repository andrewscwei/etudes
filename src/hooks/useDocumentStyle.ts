import { useLayoutEffect } from 'react'

/**
 * Type describing the options for {@link useDocumentStyle}.
 */
type Options = {
  /**
   * Specifies whether the hook is enabled, defaults to `true`.
   */
  isEnabled?: boolean
}

/**
 * Hook to apply a style string to the document's root element.
 *
 * @param style The CSS style string to apply to the document's root element.
 * @param options See {@link Options}.
 */
export function useDocumentStyle(style: string, { isEnabled = true }: Options = {}) {
  useLayoutEffect(() => {
    if (!isEnabled) return

    window.document.documentElement.style = style

    return () => {
      window.document.documentElement.style = ''
    }
  }, [style])
}
