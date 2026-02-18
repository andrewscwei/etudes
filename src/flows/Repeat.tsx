import { Fragment, type ReactNode } from 'react'

export namespace Repeat {
  /**
   * Type describing the properties of {@link Repeat}.
   */
  export type Props = {
    /**
     * The children to repeat. This is omitted if `render` is provided.
     */
    children?: ((index: number) => ReactNode) | ReactNode

    /**
     * The number of times to repeat the children.
     */
    count?: number

    /**
     * Function that overrides the default rendering of the children, invoked on
     * each index of `count`.
     */
    render?: (index: number) => ReactNode
  }
}

/**
 * A component that repeats its children, automatically assigning each a unique
 * key.
 */
export function Repeat({
  children,
  count = 1,
  render,
}: Readonly<Repeat.Props>) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Fragment key={`element-${i}`}>
          {render?.(i) ?? (typeof children === 'function' ? children(i) : children)}
        </Fragment>
      ))}
    </>
  )
}

if (process.env.NODE_ENV === 'development') {
  Repeat.displayName = 'Repeat'
}
