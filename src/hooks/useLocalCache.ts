import { useMemo } from 'react'

import { createLocalCache, type LocalCache } from '../utils/createLocalCache.js'

/**
 * Hook for creating a local cache backed by the browser's local storage.
 *
 * @param defaultTTL The default time-to-live (TTL) in seconds for cache items,
 *                   defaults to `300` (5 minutes).
 *
 * @returns The local cache.
 */
export function useLocalCache(defaultTTL?: number): LocalCache {
  const cache = useMemo(() => createLocalCache({ defaultTTL }), [defaultTTL])

  return cache
}
