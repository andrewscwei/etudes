import { useCallback, useEffect, useRef, type DependencyList, type RefObject } from 'react'

type Options = {
  autoStart?: boolean
  onTimeout?: () => void
}

type ReturnValue = {
  start: () => void
  stop: () => void
  ref: RefObject<NodeJS.Timeout | undefined>
}

export function useTimeout(timeout: number = 0, { autoStart = true, onTimeout }: Options = {}, deps: DependencyList = []): ReturnValue {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const handlerRef = useRef<(() => void)>()

  const start = useCallback(() => {
    stop()

    timeoutRef.current = setTimeout(() => {
      stop()
      handlerRef.current?.()
    }, timeout)
  }, [])

  const stop = useCallback(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = undefined
  }, [])

  useEffect(() => {
    handlerRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    if (timeout < 0) return
    if (autoStart) start()

    return () => stop()
  }, [timeout, ...deps])

  return { start, stop, ref: timeoutRef }
}
