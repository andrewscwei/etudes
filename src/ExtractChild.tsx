import classNames from 'classnames'
import _ from 'lodash'
import React, { Children, cloneElement, forwardRef, HTMLAttributes, isValidElement, PropsWithChildren } from 'react'

type Props = PropsWithChildren<HTMLAttributes<HTMLElement>>

export default forwardRef<HTMLElement, Props>(({
  children,
  className,
  ...props
}, ref) => {
  if (_.isArray(children)) {
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
