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
   * Specifies whether the interval should start automatically.
   */
  autoStarts?: boolean

  /**
   * Specifies if the handler should be invoked initially (as opposed to waiting
   * for the specified interval for the initial invocation).
   */
  shouldInvokeInitially?: boolean

  /**
   * Handler invoked when the interval is reached.
   */
  onInterval: () => void
}

/**
 * Hook for invoking a method repeatedly on every set interval.
 *
 * @param interval Time (in milliseconds) between each invocation.
 * @param options See {@link UseIntervalOptions}.
 */
export function useInterval(interval: number, {
  autoStarts = true,
  shouldInvokeInitially = false,
  onInterval,
}: UseIntervalOptions, deps: DependencyList = []): UseIntervalOutput {
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const handlerRef = useLatest(onInterval)

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = undefined
  }, [])

  const start = useCallback(() => {
    stop()

    if (interval < 0) return

    if (shouldInvokeInitially) {
      handlerRef.current()
    }

    intervalRef.current = setInterval(() => {
      handlerRef.current()
    }, interval)
  }, [interval, shouldInvokeInitially, stop])

  useEffect(() => {
    if (autoStarts && interval > 0) {
      start()
    }

    return stop
  }, [autoStarts, interval, start, stop, ...deps])

  return { start, stop }
}
