import React, { Fragment } from 'react'

type Props = {
  children: JSX.Element | ((index: number) => JSX.Element)
  count?: number
}

export default function Group({
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
