import { type CSSProperties } from 'react'

/**
 * Combines multiple representations of CSS properties into a single object.
 *
 * @param args The CSS properties to combine. Each argument can be a
 *             {@link CSSProperties} object, `undefined`, or `false`.
 *
 * @returns A single object containing all the provided CSS properties.
 */
export function styles(...args: (CSSProperties | undefined | false)[]): CSSProperties {
  return args.reduce<CSSProperties>((out, curr) => ({
    ...out,
    ...curr || {},
  }), {})
}
