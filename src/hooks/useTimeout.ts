import { useCallback, useEffect, useRef, type DependencyList, type RefObject } from 'react'

type Options = {
  autoStart?: boolean
  onTimeout?: () => void
}

type ReturnValue = {
  start: () => void
  stop: () => void
  ref: RefObject<NodeJS.Timeout> | RefObject<NodeJS.Timeout | undefined> | RefObject<NodeJS.Timeout | null>
}

export function useTimeout(timeout: number = 0, { autoStart = true, onTimeout }: Options = {}, deps: DependencyList = []): ReturnValue {
  const timeoutRef = useRef<NodeJS.Timeout>(undefined)
  const handlerRef = useRef<() => void>(undefined)

  const start = useCallback(() => {
    stop()

    if (timeout < 0) return

    timeoutRef.current = setTimeout(() => {
      stop()
      handlerRef.current?.()
    }, timeout)
  }, [timeout])

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
