import React, { Children, cloneElement, forwardRef, HTMLAttributes, isValidElement } from 'react'

export type ExtractChildProps = HTMLAttributes<HTMLElement>

/**
 * Extracts a single child of a parent component into its own component. If the parent component has
 * multiple children, only the first one will be extracted, the rest will be ignored.
 */
export default forwardRef<HTMLElement, ExtractChildProps>(({
  children,
  className,
  ...props
}, ref) => {
  if (Array.isArray(children)) {
    /* eslint-disable-next-line no-console */
    console.error(`[etudes::ExtractChild] Only one child is expected, but found ${children.length}. Only the first child is extracted while the rest are discarded.`)
  }

  return (
    <>
      {Children.map(children, (child, idx) => {
        if (idx > 0) return undefined

        if (isValidElement(child)) {
          return cloneElement(child, {
            ...props,
            className: `${className ?? ''} ${child.props.className}`.split(' ').filter(Boolean).join(' '),
            ref,
          } as any)
        }

        return child
      })}
    </>
  )
})
