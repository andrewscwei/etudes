import { createKey } from './createKey.js'

/**
 * Creates a unique key for a given value, useful for caching or memoization
 * purposes. This function handles deep comparisons.
 *
 * @param value The value to create a key for.
 *
 * @returns A unique string key representing the value.
 */
export function createKeyDeep(value: any): string {
  if (value === null || value === undefined) {
    return ''
  } else if (Array.isArray(value)) {
    return JSON.stringify(value.map(createKeyDeep))
  } else if (typeof value === 'object') {
    return JSON.stringify(Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => [key, createKeyDeep(val)]))
  } else {
    return createKey(value)
  }
}
