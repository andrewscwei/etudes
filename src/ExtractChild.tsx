import classNames from 'classnames'
import _ from 'lodash'
import React, { Children, cloneElement, forwardRef, HTMLAttributes, isValidElement, PropsWithChildren } from 'react'

export type Props = PropsWithChildren<HTMLAttributes<HTMLElement>>

/**
 * Extracts a single child of a parent component into its own component. If the parent component has
 * multiple children, only the first one will be extracted, the rest will be ignored.
 */
export default forwardRef<HTMLElement, Props>(({
  children,
  className,
  ...props
}, ref) => {
  if (_.isArray(children)) {
    /* eslint-disable-next-line no-console */
    console.error(`[etudes::ExtractChild] Only one child is expected, but found ${children.length}. Only the first child is extracted while the rest are discarded.`)
  }

  return (
    <>
      {Children.map(children, (child, idx) => {
        if (idx > 0) return undefined

        if (isValidElement(child)) {
          return cloneElement(child, { className: classNames(className, child.props.className), ...props, ref })
        }

        return child
      })}
    </>
  )
})
