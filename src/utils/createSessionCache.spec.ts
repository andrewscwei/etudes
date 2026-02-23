import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createSessionCache } from './createSessionCache.js'

describe('createSessionCache', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns undefined for a missing key', () => {
    const cache = createSessionCache()
    expect(cache.get('missing')).toBeUndefined()
  })

  it('stores and retrieves a value', () => {
    const cache = createSessionCache()
    cache.set('hello', 'key')
    expect(cache.get('key')).toBe('hello')
  })

  it('returns the set value', () => {
    const cache = createSessionCache()
    expect(cache.set(42, 'num')).toBe(42)
  })

  it('invalidates a key', () => {
    const cache = createSessionCache()
    cache.set('value', 'key')
    cache.invalidate('key')
    expect(cache.get('key')).toBeUndefined()
  })

  it('returns undefined for an expired entry', () => {
    const cache = createSessionCache({ defaultTTL: 10 })
    cache.set('value', 'key')
    vi.advanceTimersByTime(11_000)
    expect(cache.get('key')).toBeUndefined()
  })

  it('returns value for a non-expired entry', () => {
    const cache = createSessionCache({ defaultTTL: 10 })
    cache.set('value', 'key')
    vi.advanceTimersByTime(9_000)
    expect(cache.get('key')).toBe('value')
  })

  it('respects a per-entry TTL override', () => {
    const cache = createSessionCache({ defaultTTL: 60 })
    cache.set('value', 'key', 5)
    vi.advanceTimersByTime(6_000)
    expect(cache.get('key')).toBeUndefined()
  })
})
