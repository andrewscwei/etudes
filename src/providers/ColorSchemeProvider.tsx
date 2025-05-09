import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'

/**
 * Type describing the available color schemes.
 */
export type ColorScheme = 'light' | 'dark'

/**
 * Type describing the props of {@link ColorSchemeProvider}.
 */
export type ColorSchemeProviderProps = PropsWithChildren

/**
 * Type describing the value of {@link ColorSchemeContext}.
 */
export type ColorSchemeContextValue = {
  colorScheme: ColorScheme
  setColorScheme: (colorScheme: ColorScheme) => void
}

/**
 * A context provider that manages the color scheme (light or dark) of the
 * application. It uses `localStorage` to persist the user's preference across
 * sessions.
 *
 * @exports ColorSchemeContext Context for providing color scheme information.
 * @exports useColorScheme Hook for accessing the current color scheme.
 * @exports useSetColorScheme Hook for setting the color scheme.
 */
export function ColorSchemeProvider({ children }: ColorSchemeProviderProps) {
  const getInitialColorScheme = (): ColorScheme => {
    const colorScheme = localStorage.getItem('color-scheme')
    if (colorScheme) return colorScheme as ColorScheme

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    else {
      return 'light'
    }
  }

  const [colorScheme, setColorScheme] = useState<ColorScheme>(getInitialColorScheme())

  useEffect(() => {
    localStorage.setItem('color-scheme', colorScheme)
    document.documentElement.classList.toggle('dark', colorScheme === 'dark')
  }, [colorScheme])

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  )
}

/**
 * Context for providing color scheme information.
 */
export const ColorSchemeContext = createContext<ColorSchemeContextValue | undefined>(undefined)

/**
 * A hook to access the color scheme context.
 *
 * @throws If used outside of a {@link ColorSchemeProvider}.
 */
export function useColorScheme(): ColorScheme {
  const context = useContext(ColorSchemeContext)
  if (!context) throw Error('useColorScheme must be used within a ColorSchemeProvider')

  return context.colorScheme
}

/**
 * A hook to set the color scheme.
 *
 * @throws If used outside of a {@link ColorSchemeProvider}.
 */
export function useSetColorScheme() {
  const context = useContext(ColorSchemeContext)
  if (!context) throw Error('useChangeColorScheme must be used within a ColorSchemeProvider')

  return context.setColorScheme
}

if (process.env.NODE_ENV !== 'production') {
  ColorSchemeContext.displayName = 'ColorSchemeContext'
}
