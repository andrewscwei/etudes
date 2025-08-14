/**
 * Type describing options for creating a local cache.
 */
export type LocalCacheOptions = {
  /**
   * The default TTL (in seconds) to use if one is not specified upon setting a
   * value.
   */
  defaultTTL?: number
}

/**
 * Type describing a locally cached item.
 */
export type LocalCacheItem<T> = {
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
 * Type describing the local cache interface.
 */
export type LocalCache = {
  /**
   * Retrieves a value from local cache.
   *
   * @param key The key to retrieve.
   *
   * @returns The value, or `undefined` if not found or stale.
   */
  get: <T>(key: string) => T | undefined

  /**
   * Invalidates a value in local cache.
   *
   * @param key The key to invalidate.
   */
  invalidate: (key: string) => void

  /**
   * Sets a value in local cache.
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

const STORAGE = typeof window !== 'undefined' ? window.localStorage : undefined

/**
 * Returns a simple cache interface backed by the browser's local storage.
 *
 * @param options See {@link LocalCacheOptions}.
 *
 * @returns The cache interface.
 */
export function createLocalCache({ defaultTTL = 300 }: LocalCacheOptions = {}): LocalCache {
  return {
    get: _get,
    invalidate: _invalidate,
    set: <T>(val: T, key: string, ttl = defaultTTL) => _set<T>(val, key, ttl),
  }
}

function _invalidate(key: string) {
  STORAGE?.removeItem(key)
}

function _isStale<T>(item: LocalCacheItem<T>): boolean {
  const { timestamp, ttl } = item

  return (Date.now() - timestamp) / 1000 >= ttl
}

function _get<T>(key: string): T | undefined {
  const res = STORAGE?.getItem(key)
  if (!res) return undefined

  const item = JSON.parse(res) as LocalCacheItem<T>
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
