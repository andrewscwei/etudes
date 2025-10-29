import { useLayoutEffect } from 'react'

/**
 * Type describing the options for {@link useClassName}.
 */
type Options = {
  /**
   * The target element to which the class name will be added,
   * defaults to the document's root element.
   */
  element?: HTMLElement

  /**
   * Specifies whether the hook is enabled, defaults to `true`.
   */
  isEnabled?: boolean
}

/**
 * Hook for adding a class name to an element, defaults to the document's root
 * element if no element is specified.
 *
 * @param className The class name to add to the document's root element.
 * @param options See {@link Options}.
 */
export function useClassName(className: string, { element, isEnabled = true }: Options = {}) {
  useLayoutEffect(() => {
    if (!isEnabled) return

    const target = element ?? window.document.documentElement

    target.classList.add(className)

    return () => {
      target.classList.remove(className)
    }
  }, [className, element, isEnabled])
}
