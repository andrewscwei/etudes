import React, { Fragment, ReactNode } from 'react'

export type RepeatProps = {
  children?: ReactNode | ((index: number) => ReactNode)
  count?: number
  render?: (index: number) => ReactNode
}

/**
 * A tag-less component that repeats its children, automatically assigning each
 * a unique key.
 */
export default function Repeat({
  count = 1,
  children,
  render,
}: RepeatProps) {
  return (
    <>
      {[...Array(count)].map((v, i) => (
        <Fragment key={`element-${i}`}>
          {render ? render(i) : typeof children === 'function' ? children(i) : children}
        </Fragment>
      ))}
    </>
  )
}
