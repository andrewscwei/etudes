import { useEffect, useRef } from 'react'

export default function useInterval(handler: () => void, timeout?: number) {
  const handlerRef = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (timeout === undefined) return

    const timer = window.setInterval(() => handlerRef.current?.(), timeout)
    return () => clearInterval(timer)
  }, [timeout])
}
