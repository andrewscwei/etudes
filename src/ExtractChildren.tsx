import classNames from 'classnames'
import React, { Children, cloneElement, HTMLAttributes, isValidElement } from 'react'

export type Props = HTMLAttributes<HTMLElement>

/**
 * Extracts all children of a parent component into its own component.
 */
export default function ExtractChildren({
  children,
  className,
  ...props
}: Props) {
  return (
    <>
      {Children.map(children, child => {
        if (isValidElement(child)) {
          return cloneElement(child, { className: classNames(className, child.props.className), ...props } as any)
        }

        return child
      })}
    </>
  )
}
