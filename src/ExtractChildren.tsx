import React, { Children, cloneElement, HTMLAttributes, isValidElement } from 'react'

export type ExtractChildrenProps = HTMLAttributes<HTMLElement>

/**
 * Extracts all children of a parent component into its own component.
 */
export default function ExtractChildren({
  children,
  className,
  ...props
}: ExtractChildrenProps) {
  return (
    <>
      {Children.map(children, child => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            className: `${className ?? ''} ${child.props.className}`.split(' ').filter(Boolean).join(' '),
            ...props,
          } as any)
        }

        return child
      })}
    </>
  )
}
