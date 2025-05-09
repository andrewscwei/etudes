import { type CSSProperties } from 'react'

/**
 * Type-guarding function that ensures the provided dictionary is a valid
 * dictionary of CSS properties.
 *
 * @param dict A dictionary of CSS properties.
 *
 * @returns A dictionary of CSS properties.
 */
export function asStyleDict<T>(dict: { [K in keyof T]: CSSProperties }) {
  return dict
}
