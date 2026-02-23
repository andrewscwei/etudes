import { describe, expect, it } from 'vitest'

import { createKeyDeep } from './createKeyDeep.js'

describe('createKeyDeep', () => {
  it('returns empty string for null and undefined', () => {
    expect(createKeyDeep(null)).toBe('')
    expect(createKeyDeep(undefined)).toBe('')
  })

  it('handles primitive values', () => {
    expect(createKeyDeep('hello')).toBe('hello')
    expect(createKeyDeep(42)).toBe('42')
  })

  it('produces the same key for deeply equal objects', () => {
    expect(createKeyDeep({ a: { b: 1 } })).toBe(createKeyDeep({ a: { b: 1 } }))
  })

  it('produces different keys for deeply unequal objects', () => {
    expect(createKeyDeep({ a: { b: 1 } })).not.toBe(createKeyDeep({ a: { b: 2 } }))
  })

  it('sorts object keys at every depth', () => {
    const a = { b: { d: 1, c: 2 }, a: 0 }
    const b = { a: 0, b: { c: 2, d: 1 } }
    expect(createKeyDeep(a)).toBe(createKeyDeep(b))
  })

  it('handles nested arrays', () => {
    expect(createKeyDeep([[1, 2], [3, 4]])).toBe(createKeyDeep([[1, 2], [3, 4]]))
    expect(createKeyDeep([[1, 2]])).not.toBe(createKeyDeep([[1, 3]]))
  })
})
