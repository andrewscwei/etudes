import { useMemo } from 'react'

import { createSessionCache, type SessionCache } from '../utils/createSessionCache.js'

/**
 * Hook for creating a session cache backed by the browser's session storage.
 *
 * @param defaultTTL The default time-to-live (TTL) in seconds for cache items,
 *                   defaults to `300` (5 minutes).
 *
 * @returns The session cache.
 */
export function useSessionCache(defaultTTL?: number): SessionCache {
  const cache = useMemo(() => createSessionCache({ defaultTTL }), [defaultTTL])

  return cache
}
