import React, { Fragment } from 'react'

type Props<T> = {
  children: JSX.Element | ((value: T, index: number) => JSX.Element)
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
