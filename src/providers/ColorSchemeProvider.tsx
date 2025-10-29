import { createContext, useCallback, useContext, useEffect, useState, type Dispatch, type PropsWithChildren, type SetStateAction } from 'react'

const DEFAULT_COLOR_SCHEME: ColorScheme = 'light'

/**
 * Type describing the available color schemes.
 */
export type ColorScheme = 'light' | 'dark'

export namespace ColorScheme {
  /**
   * A function that toggles a color scheme between light and dark.
   *
   * @param colorScheme The color scheme to toggle.
   *
   * @returns The toggled color scheme.
   */
  export function toggled(colorScheme: ColorScheme): ColorScheme {
    return colorScheme === 'light' ? 'dark' : 'light'
  }
}

/**
 * Type describing the props of {@link ColorSchemeProvider}.
 */
export type ColorSchemeProviderProps = PropsWithChildren<{
  /**
   * The key to use for storing the color scheme in `localStorage`. If not
   * provided, the color scheme will not be persisted.
   */
  cacheKey?: string

  /**
   * The initial color scheme to use. If not provided, the color scheme will be
   * determined based on the user's system preference.
   */
  colorScheme?: ColorScheme
}>

/**
 * Type describing the value of {@link ColorSchemeContext}.
 */
export type ColorSchemeContextValue = {
  colorScheme: ColorScheme
  setColorScheme: Dispatch<SetStateAction<ColorScheme>>
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
export function ColorSchemeProvider({ colorScheme: initialColorScheme, cacheKey, children }: ColorSchemeProviderProps) {
  const getInitialColorScheme = (): ColorScheme => {
    if (typeof window === 'undefined') return initialColorScheme ?? DEFAULT_COLOR_SCHEME

    if (cacheKey) {
      const colorScheme = window.localStorage.getItem(cacheKey)
      if (colorScheme) return colorScheme as ColorScheme
    }

    if (initialColorScheme) {
      return initialColorScheme
    }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    else {
      return 'light'
    }
  }

  const [colorScheme, setColorScheme] = useState<ColorScheme>(getInitialColorScheme())

  useEffect(() => {
    if (cacheKey) {
      window.localStorage.setItem(cacheKey, colorScheme)
    }

    window.document.documentElement.classList.toggle('dark', colorScheme === 'dark')
  }, [cacheKey, colorScheme])

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

  if (!context) {
    return DEFAULT_COLOR_SCHEME
  }

  return context.colorScheme
}

/**
 * A hook to set the color scheme.
 *
 * @throws If used outside of a {@link ColorSchemeProvider}.
 */
export function useSetColorScheme() {
  const context = useContext(ColorSchemeContext)

  if (!context) {
    return () => {}
  }

  return context.setColorScheme
}

/**
 * A hook to toggle the color scheme between light and dark.
 *
 * @throws If used outside of a {@link ColorSchemeProvider}.
 */
export function useToggleColorScheme() {
  const context = useContext(ColorSchemeContext)

  if (!context) {
    return () => {}
  }

  return useCallback(() => {
    context.setColorScheme(prev => ColorScheme.toggled(prev))
  }, [])
}

if (process.env.NODE_ENV === 'development') {
  ColorSchemeContext.displayName = 'ColorSchemeContext'
}
