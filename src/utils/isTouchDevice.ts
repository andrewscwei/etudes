export function isTouchDevice(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false

  if (typeof navigator !== 'undefined') {
    if (navigator.maxTouchPoints > 0 || (('msMaxTouchPoints' in navigator) && ((navigator as any).msMaxTouchPoints > 0))) {
      return true
    }
  }

  if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches) {
    return true
  }

  if ('ontouchstart' in window || 'ontouchstart' in document.documentElement) {
    return true
  }

  return false
}
