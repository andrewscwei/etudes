import { type DependencyList, useCallback, useEffect, useRef } from 'react'

import { useLatest } from './useLatest.js'

/**
 * Type describing the output of {@link useInterval}.
 */
export type UseIntervalOutput = {
  /**
   * Function to start the interval.
   */
  start: () => void

  /**
   * Function to stop the interval.
   */
  stop: () => void
}

/**
 * Type describing the options of {@link useInterval}.
 */
export type UseIntervalOptions = {
  /**
   * Specifies whether the interval is enabled. If false, the interval will not
   * be started, and any existing interval will be stopped. If true, the
   * interval will be started if it is not already running.
   */
  isEnabled?: boolean

  /**
   * Specifies whether the interval should start automatically.
   */
  shouldAutoStart?: boolean

  /**
   * Specifies if the handler should be invoked initially (as opposed to waiting
   * for the specified interval for the initial invocation).
   */
  shouldInvokeInitially?: boolean
}

/**
 * Hook for invoking a method repeatedly on every set interval.
 *
 * @param interval Time (in milliseconds) between each invocation.
 * @param handler Handler invoked when the interval is reached.
 * @param options See {@link UseIntervalOptions}.
 */
export function useInterval(
  interval: number,
  handler: () => void,
  {
    isEnabled = true,
    shouldAutoStart = true,
    shouldInvokeInitially = false,
  }: UseIntervalOptions = {},
  deps: DependencyList = [],
): UseIntervalOutput {
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const handlerRef = useLatest(handler)

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = undefined
  }, [])

  const start = useCallback(() => {
    stop()

    if (interval < 0 || !isEnabled) return

    if (shouldInvokeInitially) {
      handlerRef.current()
    }

    intervalRef.current = setInterval(() => {
      handlerRef.current()
    }, interval)
  }, [interval, isEnabled, shouldInvokeInitially, stop])

  useEffect(() => {
    if (shouldAutoStart && interval > 0 && isEnabled) {
      start()
    }

    return stop
  }, [shouldAutoStart, interval, isEnabled, start, stop, ...deps])

  return { start, stop }
}
