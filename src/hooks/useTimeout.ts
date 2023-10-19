import { useEffect, useRef, type DependencyList } from 'react'

/**
 * Hoook for invoking a method after a set timeout.
 *
 * @param handler The method to invoke.
 * @param timeout Time (in milliseconds) for the timeout.
 * @param deps Dependencies that trigger this effect.
 */
export function useTimeout(handler: () => void, timeout?: number, deps?: DependencyList) {
  const handlerRef = useRef<(() => void)>()

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (timeout === undefined || timeout <= 0) return

    const timer = window.setTimeout(() => handlerRef.current?.(), timeout)

    return () => clearTimeout(timer)
  }, [...deps ? deps : [], timeout])
}
