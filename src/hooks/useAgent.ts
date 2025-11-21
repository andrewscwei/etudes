import { useMemo } from 'react'

type OS = 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown'

export function useAgent(): OS {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

  return useMemo(() => {
    switch (true) {
      case /android/i.test(userAgent):
        return 'android'
      case /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream:
        return 'ios'
      case /win/i.test(userAgent):
        return 'windows'
      case /mac/i.test(userAgent):
        return 'macos'
      case /linux/i.test(userAgent):
        return 'linux'
      default:
        return 'unknown'
    }
  }, [userAgent])
}
