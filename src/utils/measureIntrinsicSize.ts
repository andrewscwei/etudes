import { Size } from 'spase'

export function measureIntrinsicSize(element: HTMLElement, maxWidth?: number): Size {
  if (typeof window === 'undefined') return Size.zero

  const el = element.cloneNode(true) as HTMLElement
  el.style.position = 'fixed'
  el.style.visibility = 'hidden'
  el.style.width = maxWidth !== undefined ? `${maxWidth}px` : 'auto'
  el.style.whiteSpace = maxWidth !== undefined ? 'normal' : 'pre'

  const parent = element.parentNode ?? document.body

  try {
    parent.insertBefore(el, element.nextSibling)
    const rect = el.getBoundingClientRect()

    return Size.make(rect.width, rect.height)
  } finally {
    el.remove()
  }
}
