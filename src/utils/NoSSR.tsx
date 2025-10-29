import { Suspense, useEffect, useState, type PropsWithChildren, type ReactNode } from 'react'

type Props = PropsWithChildren<{
  fallback?: ReactNode
}>

export function NoSSR({
  children,
  fallback = undefined,
}: Props) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(typeof window !== 'undefined')
  }, [])

  if (!isClient) return undefined

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}
