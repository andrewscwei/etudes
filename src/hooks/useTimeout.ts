import { useCallback, useEffect, useRef } from 'react'

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
   * Specifies whether the timeout should start automatically.
   */
  autoStarts?: boolean

  /**
   * Handler invoked when the timeout is reached.
   */
  onTimeout: () => void
}

/**
 * Hook for managing a timeout.
 *
 * @param timeout The timeout duration in milliseconds.
 * @param options See {@link UseTimeoutOptions}.
 *
 * @returns See {@link UseTimeoutOutput}.
 */
export function useTimeout(timeout: number, {
  autoStarts = true,
  onTimeout,
}: UseTimeoutOptions): UseTimeoutOutput {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const handlerRef = useRef(onTimeout)

  const stop = useCallback(() => {
    if (timeoutRef.current === undefined) return

    clearTimeout(timeoutRef.current)

    timeoutRef.current = undefined
  }, [])

  const start = useCallback(() => {
    stop()

    if (timeout < 0) return

    timeoutRef.current = setTimeout(() => {
      stop()
      handlerRef.current()
    }, timeout)
  }, [timeout, stop])

  useEffect(() => {
    handlerRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    if (autoStarts && timeout >= 0) {
      start()
    }

    return stop
  }, [autoStarts, timeout, start, stop])

  return { start, stop }
}
