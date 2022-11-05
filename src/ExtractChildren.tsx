import React, { Children, HTMLAttributes, isValidElement } from 'react'
import cloneStyledElement from './utils/cloneStyledElement'

export type ExtractChildrenProps = HTMLAttributes<HTMLElement>

/**
 * Extracts all children of a parent component into its own component.
 */
export default function ExtractChildren({
  children,
  ...props
}: ExtractChildrenProps) {
  return (
    <>
      {Children.map(children, child => {
        if (isValidElement(child)) {
          return cloneStyledElement(child, { ...props })
        }
        else {
          return child
        }
      })}
    </>
  )
}
