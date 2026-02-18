import { useLayoutEffect, useState } from 'react'

type ColorScheme = 'dark' | 'light'

/**
 * Hook for getting the current system color scheme. The color scheme is updated
 * automatically when the system color scheme changes.
 *
 * @returns The current system color scheme.
 */
export function useSystemColorScheme(defaultValue: ColorScheme = 'light'): ColorScheme {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(defaultValue)

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
