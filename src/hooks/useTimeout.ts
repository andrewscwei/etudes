import { type DependencyList, useCallback, useEffect, useRef } from 'react'

import { useLatest } from './useLatest.js'

/**
 * Type describing the output of {@link useTimeout}.
 */
export type UseTimeoutOutput = {
  /**
   * Function to start the timeout.
   */
  start: () => void

  /**
   * Function to stop the timeout.
   */
  stop: () => void
}

/**
 * Type describing the options of {@link useTimeout}.
 */
export type UseTimeoutOptions = {
  /**
   * Specifies whether the timeout is enabled. If false, the timeout will not be
   * started, and any existing timeout will be stopped. If true, the timeout
   * will be started if it is not already running.
   */
  isEnabled?: boolean

  /**
   * Specifies whether the timeout should start automatically.
   */
  shouldAutoStart?: boolean
}

/**
 * Hook for managing a timeout.
 *
 * @param timeout The timeout duration in milliseconds.
 * @param handler Handler invoked when the timeout is reached.
 * @param options See {@link UseTimeoutOptions}.
 *
 * @returns See {@link UseTimeoutOutput}.
 */
export function useTimeout(
  timeout: number,
  handler: () => void,
  {
    isEnabled = true,
    shouldAutoStart = true,
  }: UseTimeoutOptions = {},
  deps: DependencyList = [],
): UseTimeoutOutput {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const handlerRef = useLatest(handler)

  const stop = useCallback(() => {
    if (timeoutRef.current === undefined) return

    clearTimeout(timeoutRef.current)

    timeoutRef.current = undefined
  }, [])

  const start = useCallback(() => {
    stop()

    if (timeout < 0 || !isEnabled) return

    timeoutRef.current = setTimeout(() => {
      stop()
      handlerRef.current()
    }, timeout)
  }, [timeout, isEnabled, stop])

  useEffect(() => {
    if (shouldAutoStart && timeout >= 0 && isEnabled) {
      start()
    }

    return stop
  }, [shouldAutoStart, isEnabled, timeout, start, stop, ...deps])

  return { start, stop }
}
