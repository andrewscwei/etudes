import { useMemo } from 'react'
import { getDPR } from '../utils/getDPR.js'

/**
 * Hook for getting the device pixel ratio.
 *
 * @returns The device pixel ratio of the current device.
 */
export function useDPR(): number {
  return useMemo(() => getDPR(), [])
}
