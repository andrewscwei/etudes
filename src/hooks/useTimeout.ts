import { useEffect, useRef } from 'react'

/**
 * Hoook for invoking a method after a set timeout.
 *
 * @param handler The method to invoke.
 * @param timeout Time (in milliseconds) for the timeout. If the value is
 *                `undefined` or less than 0, the timeout is disabled.
 */
export function useTimeout(handler: () => void, timeout?: number) {
  const handlerRef = useRef<(() => void)>()

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (timeout === undefined || timeout < 0) return

    const timer = window.setTimeout(() => handlerRef.current?.(), timeout)

    return () => clearTimeout(timer)
  }, [timeout])
}
