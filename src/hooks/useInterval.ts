import { useEffect, useRef, type DependencyList } from 'react'

type Options = {
  /**
   * Specifies if the handler should be invoked initially (as opposed to waiting
   * for the specified interval for the initial invocation).
   */
  shouldInvokeInitially?: boolean
}

/**
 * Hoook for invoking a method repeatedly on every set interval.
 *
 * @param handler The method to invoke on every interval.
 * @param timeout Time (in milliseconds) between each invocation.
 * @param options See {@link Options}.
 * @param deps Dependencies that trigger this effect.
 */
export default function useInterval(handler: () => void, timeout?: number, { shouldInvokeInitially = false }: Options = {}, deps?: DependencyList) {
  const handlerRef = useRef<(() => void)>()

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (timeout === undefined) return

    if (shouldInvokeInitially === true) handlerRef.current?.()
    const timer = window.setInterval(() => handlerRef.current?.(), timeout)

    return () => clearInterval(timer)
  }, [...deps ? deps : [], timeout])
}
