import { Fragment, type ReactNode } from 'react'

/**
 * Type describing the properties of {@link Each}.
 */
export type EachProps<T> = {
  children?: ReactNode | ((value: T, index: number) => ReactNode)
  in?: T[]
  render?: (value: T, index: number) => ReactNode
}

/**
 * Component for rendering a list of items.
 */
export function Each<T>({
  in: array,
  children,
  render,
}: Readonly<EachProps<T>>) {
  if (array === undefined || array === null) return <></>
  if (!(array instanceof Array)) throw TypeError(`Provided list <${array}> is not an array`)

  return (
    <>
      {array.map((v, i) => (
        <Fragment key={`item-${i}`}>
          {render?.(v, i) ?? (typeof children === 'function' ? children(v, i) : children)}
        </Fragment>
      ))}
    </>
  )
}

if (process.env.NODE_ENV !== 'production') {
  Each.displayName = 'Each'
}
