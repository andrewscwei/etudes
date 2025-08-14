import { useLayoutEffect } from 'react'

/**
 * Type describing the options for {@link useDocumentClassName}.
 */
type Options = {
  /**
   * Specifies whether the hook is enabled, defaults to `true`.
   */
  isEnabled?: boolean
}

/**
 * Hook for adding a class name to the document's root element.
 *
 * @param className The class name to add to the document's root element.
 * @param options See {@link Options}.
 */
export function useDocumentClassName(className: string, { isEnabled = true }: Options = {}) {
  useLayoutEffect(() => {
    if (!isEnabled) return

    window.document.documentElement.classList.add(className)

    return () => {
      window.document.documentElement.classList.remove(className)
    }
  }, [className, isEnabled])
}
