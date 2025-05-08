import { Fragment, type ReactNode } from 'react'

/**
 * Type describing the properties of {@link Each}.
 */
export type EachProps<T> = {
  /**
   * The children to repeat. This is omitted if `render` is provided.
   */
  children?: ReactNode | ((value: T, index: number) => ReactNode)

  /**
   * The array of items to iterate over.
   */
  in?: T[]

  /**
   * Function that overrides the default rendering of the children, invoked on
   * each item in the array.
   */
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
