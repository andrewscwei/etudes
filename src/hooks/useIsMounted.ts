import { useEffect, useState } from 'react'

/**
 * Hook for determining if the component is mounted.
 *
 * @returns `true` if the component is mounted, `false` otherwise.
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    return () => {
      setIsMounted(false)
    }
  }, [])

  return isMounted
}
