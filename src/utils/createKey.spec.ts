import { describe, expect, it } from 'vitest'

import { createKey } from './createKey.js'

describe('createKey', () => {
  it('returns empty string for null', () => {
    expect(createKey(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(createKey(undefined)).toBe('')
  })

  it('stringifies primitives', () => {
    expect(createKey('hello')).toBe('hello')
    expect(createKey(42)).toBe('42')
    expect(createKey(true)).toBe('true')
    expect(createKey(false)).toBe('false')
  })

  it('converts a Date to ISO string', () => {
    const date = new Date('2024-01-01T00:00:00.000Z')
    expect(createKey(date)).toBe(date.toISOString())
  })

  it('converts a RegExp to its string representation', () => {
    expect(createKey(/foo/g)).toBe('/foo/g')
  })

  it('produces the same key for arrays with equal contents', () => {
    expect(createKey([1, 2, 3])).toBe(createKey([1, 2, 3]))
  })

  it('produces different keys for arrays with different contents', () => {
    expect(createKey([1, 2])).not.toBe(createKey([1, 3]))
  })

  it('produces the same key for objects regardless of key order', () => {
    expect(createKey({ b: 2, a: 1 })).toBe(createKey({ a: 1, b: 2 }))
  })

  it('produces different keys for objects with different values', () => {
    expect(createKey({ a: 1 })).not.toBe(createKey({ a: 2 }))
  })

  it('handles Map', () => {
    const a = new Map([['x', 1]])
    const b = new Map([['x', 1]])
    expect(createKey(a)).toBe(createKey(b))
  })

  it('handles Set', () => {
    const a = new Set([1, 2])
    const b = new Set([1, 2])
    expect(createKey(a)).toBe(createKey(b))
  })

  it('returns empty string for WeakMap and WeakSet', () => {
    expect(createKey(new WeakMap())).toBe('')
    expect(createKey(new WeakSet())).toBe('')
  })
})
