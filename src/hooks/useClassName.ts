import { useLayoutEffect } from 'react'

/**
 * Type describing the options for {@link useClassName}.
 */
type Options = {
  /**
   * The target element to which the class name will be added, defaults to the
   * document's root element.
   */
  target?: HTMLElement

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
export function useClassName(className: string, { target, isEnabled = true }: Options = {}) {
  useLayoutEffect(() => {
    if (!isEnabled) return

    const el = target ?? window.document.documentElement
    const hasClassName = el.classList.contains(className)

    if (!hasClassName) {
      el.classList.add(className)
    }

    return () => {
      if (!hasClassName) {
        el.classList.remove(className)
      }
    }
  }, [className, target, isEnabled])
}
