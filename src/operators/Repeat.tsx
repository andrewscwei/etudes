import { Fragment, type ReactNode } from 'react'

export type RepeatProps = {
  children?: ReactNode | ((index: number) => ReactNode)
  count?: number
  render?: (index: number) => ReactNode
}

/**
 * A tag-less component that repeats its children, automatically assigning each
 * a unique key.
 */
export function Repeat({
  count = 1,
  children,
  render,
}: Readonly<RepeatProps>) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Fragment key={`element-${i}`}>
          {render?.(i) ?? (typeof children === 'function' ? children(i) : children)}
        </Fragment>
      ))}
    </>
  )
}

Repeat.displayName = 'Repeat'
