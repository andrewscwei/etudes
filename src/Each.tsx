import React, { Fragment, ReactNode } from 'react'

export type Props<T> = {
  children: ReactNode | ((value: T, index: number) => ReactNode)
  list?: T[]
}

export default function Each<T>({
  list,
  children,
}: Props<T>) {
  if (list === undefined || list === null) return <></>
  if (!(list instanceof Array)) throw TypeError(`Provided list must be an array: ${list}`)

  return (
    <>
      {list.map((v, i) => (
        <Fragment key={`item-${i}`}>
          {typeof children === 'function' ? children(v, i) : children}
        </Fragment>
      ))}
    </>
  )
}
