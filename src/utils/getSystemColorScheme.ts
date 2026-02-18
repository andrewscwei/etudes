/**
 * Detects the system color scheme preference.
 *
 * @returns The system color scheme, either 'light' or 'dark'.
 */
export function getSystemColorScheme(): 'dark' | 'light' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

    return isDarkMode ? 'dark' : 'light'
  }

  return 'light'
}
