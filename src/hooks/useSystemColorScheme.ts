import { useLayoutEffect, useState } from 'react'

type ColorScheme = 'light' | 'dark'

export function useSystemColorScheme(): ColorScheme {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light')

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function onChange(event: MediaQueryListEvent) {
      setColorScheme(event.matches ? 'dark' : 'light')
    }

    setColorScheme(mediaQuery.matches ? 'dark' : 'light')

    mediaQuery.addEventListener('change', onChange)

    return () => {
      mediaQuery.removeEventListener('change', onChange)
    }
  }, [])

  return colorScheme
}
