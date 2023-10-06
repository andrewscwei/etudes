import { useEffect } from 'react'
import { useLocation } from 'react-router'

export function useScrollPositionReset() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])
}
