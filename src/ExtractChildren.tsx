import classNames from 'classnames'
import React, { Children, cloneElement, HTMLAttributes, isValidElement, PropsWithChildren } from 'react'

/**
 * Extracts all children of a parent component into its own component.
 */
export default function ExtractChildren({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <>
      {Children.map(children, (child, idx) => {
        if (isValidElement(child)) {
          return cloneElement(child, { className: classNames(className, child.props.className), ...props })
        }

        return child
      })}
    </>
  )
}
