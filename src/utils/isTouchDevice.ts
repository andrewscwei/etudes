/**
 * Determines if the current device is a touch device.
 *
 * @returns `true` if the device supports touch input, otherwise `false`.
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false

  if (typeof window.navigator !== 'undefined') {
    if (window.navigator.maxTouchPoints > 0 || (('msMaxTouchPoints' in window.navigator) && ((window.navigator as any).msMaxTouchPoints > 0))) {
      return true
    }
  }

  if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches) {
    return true
  }

  if ('ontouchstart' in window || 'ontouchstart' in window.document.documentElement) {
    return true
  }

  return false
}
