import { useCallback, useEffect, useRef } from 'react'

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
}: UseIntervalOptions): UseIntervalOutput {
  const intervalRef = useRef<NodeJS.Timeout>(undefined)

  const stop = useCallback(() => {
    if (intervalRef.current === undefined) return

    clearInterval(intervalRef.current)

    intervalRef.current = undefined
  }, [])

  const start = useCallback(() => {
    stop()

    if (interval < 0) return

    intervalRef.current = setInterval(onInterval, interval)
  }, [interval, stop, onInterval])

  useEffect(() => {
    if (interval <= 0) return
    if (autoStarts) {
      start()

      if (shouldInvokeInitially === true) {
        onInterval()
      }
    }

    return () => stop()
  }, [autoStarts, interval, shouldInvokeInitially, onInterval])

  return {
    start,
    stop,
  }
}
