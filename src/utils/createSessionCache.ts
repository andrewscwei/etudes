/**
 * Type describing options for creating a session cache.
 */
export type SessionCacheOptions = {
  /**
   * The default TTL (in seconds) to use if one is not specified upon setting a
   * value.
   */
  defaultTTL?: number
}

/**
 * Type describing a session cached item.
 */
export type SessionCacheItem<T> = {
  /**
   * The timestamp (in milliseconds since epoch) when the item was cached.
   */
  timestamp: number

  /**
   * The TTL (in seconds) for the item.
   */
  ttl: number

  /**
   * The cached value.
   */
  value: T
}

/**
 * Type describing the session cache interface.
 */
export type SessionCache = {
  /**
   * Retrieves a value from session cache.
   *
   * @param key The key to retrieve.
   *
   * @returns The value, or `undefined` if not found or stale.
   */
  get: <T>(key: string) => T | undefined

  /**
   * Invalidates a value in session cache.
   *
   * @param key The key to invalidate.
   */
  invalidate: (key: string) => void

  /**
   * Sets a value in session cache.
   *
   * @param value The value to set.
   * @param key The key to set.
   * @param ttl Optional TTL (in seconds) for the value, defaults to the
   *            `defaultTTL` specified when creating the adapter.
   *
   * @returns The value that was set.
   */
  set: <T>(value: T, key: string, ttl?: number) => T
}

const STORAGE = typeof window !== 'undefined' ? window.sessionStorage : undefined

/**
 * Returns a simple cache interface backed by the browser's session storage.
 *
 * @param options See {@link SessionCacheOptions}.
 *
 * @returns The cache interface.
 */
export function createSessionCache({ defaultTTL = 300 }: SessionCacheOptions = {}): SessionCache {
  return {
    get: _get,
    invalidate: _invalidate,
    set: <T>(val: T, key: string, ttl = defaultTTL) => _set<T>(val, key, ttl),
  }
}

function _invalidate(key: string) {
  STORAGE?.removeItem(key)
}

function _isStale<T>(item: SessionCacheItem<T>): boolean {
  const { timestamp, ttl } = item

  return (Date.now() - timestamp) / 1000 >= ttl
}

function _get<T>(key: string): T | undefined {
  const res = STORAGE?.getItem(key)
  if (!res) return undefined

  const item = JSON.parse(res) as SessionCacheItem<T>
  if (!item) return undefined

  if (_isStale(item)) {
    _invalidate(key)

    return undefined
  }
  else {
    return item.value
  }
}

function _set<T>(value: T, key: string, ttl: number): T {
  const item = {
    value,
    timestamp: Date.now(),
    ttl,
  }

  STORAGE?.setItem(key, JSON.stringify(item))

  return value
}
