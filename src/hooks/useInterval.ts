import { useEffect, useRef } from 'react'

/**
 * Type describing the options of {@link useImageLoader}.
 */
export type UseIntervalOptions = {
  /**
   * Specifies if the handler should be invoked initially (as opposed to waiting
   * for the specified interval for the initial invocation).
   */
  shouldInvokeInitially?: boolean
}

/**
 * Hook for invoking a method repeatedly on every set interval.
 *
 * @param handler The method to invoke on every interval.
 * @param interval Time (in milliseconds) between each invocation.
 * @param options See {@link UseIntervalOptions}.
 */
export function useInterval(handler: () => void, interval?: number, { shouldInvokeInitially = false }: UseIntervalOptions = {}) {
  const handlerRef = useRef<() => void>(undefined)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (interval === undefined || interval <= 0) return

    if (shouldInvokeInitially === true) handlerRef.current?.()
    const timer = window.setInterval(() => handlerRef.current?.(), interval)

    return () => clearInterval(timer)
  }, [interval])
}
