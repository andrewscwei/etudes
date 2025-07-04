import { Children, isValidElement, type HTMLAttributes } from 'react'
import { cloneStyledElement } from '../utils/cloneStyledElement.js'

/**
 * Type describing the properties of {@link ExtractChildren}.
 */
export type ExtractChildrenProps = HTMLAttributes<HTMLElement>

/**
 * Extracts all children of a parent component into its own component.
 */
export function ExtractChildren({
  children,
  ...props
}: Readonly<ExtractChildrenProps>) {
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

if (process.env.NODE_ENV === 'development') {
  ExtractChildren.displayName = 'ExtractChildren'
}
