import { type PropsWithChildren, type ReactNode, Suspense, useSyncExternalStore } from 'react'

export namespace NoSSR {
  /**
   * Type describing the props of {@link NoSSR}.
   */
  export type Props = PropsWithChildren<{
    /**
     * Fallback node to render on the server, during hydration, and while
     * children suspend.
     */
    fallback?: ReactNode
  }>
}

/**
 * Renders its children only on the client. On the server and during hydration,
 * `fallback` is rendered instead.
 */
export function NoSSR({
  children,
  fallback,
}: Readonly<NoSSR.Props>) {
  const isClient = useSyncExternalStore(_subscribe, _getClientSnapshot, _getServerSnapshot)

  if (!isClient) return fallback

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

if (process.env.NODE_ENV === 'development') {
  NoSSR.displayName = 'NoSSR'
}

function _subscribe() {
  return () => {}
}

function _getClientSnapshot() {
  return true
}

function _getServerSnapshot() {
  return false
}
