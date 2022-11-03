import React, { Fragment, ReactNode } from 'react'

export type EachProps<T> = {
  children?: ReactNode | ((value: T, index: number) => ReactNode)
  in?: T[]
  render?: (value: T, index: number) => ReactNode
}

export default function Each<T>({
  in: array,
  children,
  render,
}: EachProps<T>) {
  if (array === undefined || array === null) return <></>
  if (!(array instanceof Array)) throw TypeError(`Provided list <${array}> is not an array`)

  return (
    <>
      {array.map((v, i) => (
        <Fragment key={`item-${i}`}>
          {render ? render(v, i) : typeof children === 'function' ? children(v, i) : children}
        </Fragment>
      ))}
    </>
  )
}
