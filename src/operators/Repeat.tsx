import { Fragment, type ReactNode } from 'react'

/**
 * Type describing the properties of {@link Repeat}.
 */
export type RepeatProps = {
  /**
   * The children to repeat.
   */
  children?: ReactNode | ((index: number) => ReactNode)

  /**
   * The number of times to repeat the children.
   */
  count?: number

  /**
   * Render function to be called for each index.
   */
  render?: (index: number) => ReactNode
}

/**
 * A component that repeats its children, automatically assigning each a unique
 * key.
 */
export function Repeat({
  count = 1,
  children,
  render,
}: Readonly<RepeatProps>) {
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

if (process.env.NODE_ENV !== 'production') {
  Repeat.displayName = 'Repeat'
}
