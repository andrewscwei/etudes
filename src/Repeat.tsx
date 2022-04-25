import React, { Fragment, ReactNode } from 'react'

export type Props = {
  children: ReactNode | ((index: number) => ReactNode)
  count?: number
}

/**
 * A tag-less component that repeats its children, automatically assigning each a unique key.
 */
export default function Repeat({
  count = 1,
  children,
}: Props) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Fragment key={`element-${i}`}>
          {typeof children === 'function' ? children(i) : children}
        </Fragment>
      ))}
    </>
  )
}
