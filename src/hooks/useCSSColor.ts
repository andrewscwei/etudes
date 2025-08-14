import { useCSSProperty } from './useCSSProperty.js'

/**
 * Hook for retrieving a custom CSS color property.
 *
 * @param name The name of the color property, e.g., 'primary', 'secondary'. The
 *             leading '--color-' is automatically prepended.
 * @param fallback The fallback color to return if the property is not defined.
 *
 * @returns The value of the CSS color property, or the fallback color if the
 *          property is not defined.
 */
export function useCSSColor(name: string, fallback: string): string {
  return useCSSProperty(`--color-${name}`) ?? fallback
}
