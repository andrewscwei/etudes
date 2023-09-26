import React, { Children, forwardRef, isValidElement, type HTMLAttributes } from 'react'
import { cloneStyledElement } from './utils'

export type ExtractChildProps = HTMLAttributes<HTMLElement>

/**
 * Extracts a single child of a parent component into its own component. If the
 * parent component has multiple children, only the first one will be extracted,
 * the rest will be ignored.
 */
export const ExtractChild = forwardRef<HTMLElement, ExtractChildProps>(({
  children,
  ...props
}, ref) => {
  if (Array.isArray(children)) {
    console.error(`[etudes::ExtractChild] Only one child is expected, but found ${children.length}. Only the first child is extracted while the rest are discarded.`)
  }

  return (
    <>
      {Children.map(children, (child, idx) => {
        if (idx > 0) {
          return undefined
        }
        else if (isValidElement(child)) {
          return cloneStyledElement(child, { ...props, ref } as any)
        }
        else {
          return child
        }
      })}
    </>
  )
})
