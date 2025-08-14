/**
 * Hook for getting the device pixel ratio.
 *
 * @returns The device pixel ratio of the current device.
 */
export function useDPR(): number {
  if (typeof window === 'undefined') {
    return 1
  }

  return window.devicePixelRatio || 1
}
