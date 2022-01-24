import React, { Fragment } from 'react'

export type Props = {
  children: JSX.Element | ((index: number) => JSX.Element)
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
