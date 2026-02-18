import { useMemo } from 'react'

import { isTouchDevice } from '../utils/isTouchDevice.js'

/**
 * Returns whether the current device is a touch device.
 *
 * @returns `true` if the device supports touch input, otherwise `false`.
 */
export function useIsTouchDevice(): boolean {
  return useMemo(() => isTouchDevice(), [])
}
