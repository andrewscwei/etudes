import classNames from 'classnames'
import React, { Children, cloneElement, HTMLAttributes, isValidElement, PropsWithChildren } from 'react'

export default function ExtractChildren({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <>
      {Children.map(children, child => {
        if (isValidElement(child)) {
          return cloneElement(child, { className: classNames(className, child.props.className), ...props })
        }

        return child
      })}
    </>
  )
}
