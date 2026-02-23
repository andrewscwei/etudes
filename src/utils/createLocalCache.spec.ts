import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createLocalCache } from './createLocalCache.js'

describe('createLocalCache', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns undefined for a missing key', () => {
    const cache = createLocalCache()
    expect(cache.get('missing')).toBeUndefined()
  })

  it('stores and retrieves a value', () => {
    const cache = createLocalCache()
    cache.set('hello', 'key')
    expect(cache.get('key')).toBe('hello')
  })

  it('returns the set value', () => {
    const cache = createLocalCache()
    const result = cache.set(42, 'num')
    expect(result).toBe(42)
  })

  it('stores complex values', () => {
    const cache = createLocalCache()
    const obj = { a: 1, b: [2, 3] }
    cache.set(obj, 'obj')
    expect(cache.get('obj')).toEqual(obj)
  })

  it('invalidates a key', () => {
    const cache = createLocalCache()
    cache.set('value', 'key')
    cache.invalidate('key')
    expect(cache.get('key')).toBeUndefined()
  })

  it('returns undefined for an expired entry', () => {
    const cache = createLocalCache({ defaultTTL: 10 })
    cache.set('value', 'key')
    vi.advanceTimersByTime(11_000)
    expect(cache.get('key')).toBeUndefined()
  })

  it('returns value for a non-expired entry', () => {
    const cache = createLocalCache({ defaultTTL: 10 })
    cache.set('value', 'key')
    vi.advanceTimersByTime(9_000)
    expect(cache.get('key')).toBe('value')
  })

  it('respects a per-entry TTL override', () => {
    const cache = createLocalCache({ defaultTTL: 60 })
    cache.set('value', 'key', 5)
    vi.advanceTimersByTime(6_000)
    expect(cache.get('key')).toBeUndefined()
  })
})
