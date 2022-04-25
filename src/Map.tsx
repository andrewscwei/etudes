import React, { Fragment, ReactNode } from 'react'

export type Props<T> = {
  children: ReactNode | ((value: T, index: number) => ReactNode)
  array?: T[]
}

export default function Map<T>({
  array,
  children,
}: Props<T>) {
  if (!(array instanceof Array)) throw TypeError(`Provided collection must be an array: ${array}`)

  return (
    <>
      {array.map((v, i) => (
        <Fragment key={`element-${i}`}>
          {typeof children === 'function' ? children(v, i) : children}
        </Fragment>
      ))}
    </>
  )
}
