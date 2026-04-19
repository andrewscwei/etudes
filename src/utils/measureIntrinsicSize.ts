import { Size } from 'spase'

/**
 * Measures the intrinsic size of an element, optionally constrained by a
 * maximum width.
 *
 * @param element The element to measure.
 * @param maxWidth Optional maximum width to constrain the measurement
 *
 * @returns The intrinsic size of the element, considering the max width
 *          constraint if provided.
 */
export function measureIntrinsicSize(element: HTMLElement, maxWidth?: number): Size.Size {
  if (typeof window === 'undefined') return Size.zero

  const el = element.cloneNode(true) as HTMLElement
  el.style.position = 'fixed'
  el.style.visibility = 'hidden'

  const parent = element.parentNode ?? document.body

  try {
    parent.insertBefore(el, element.nextSibling)

    // First measure unconstrained width
    el.style.width = 'auto'
    el.style.whiteSpace = 'pre'
    const naturalWidth = el.getBoundingClientRect().width

    // If content exceeds max, re-measure with constraint to get wrapped height
    if (maxWidth !== undefined && naturalWidth > maxWidth) {
      el.style.width = `${maxWidth}px`
      el.style.whiteSpace = 'normal'

      const rect = el.getBoundingClientRect()

      return Size.make(rect.width, rect.height)
    }

    // Content fits within max (or no max specified), use natural size
    const rect = el.getBoundingClientRect()

    return Size.make(rect.width, rect.height)
  } finally {
    el.remove()
  }
}
