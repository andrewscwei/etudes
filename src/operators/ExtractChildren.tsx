import React, { Children, isValidElement, type HTMLAttributes } from 'react'
import { cloneStyledElement } from '../utils'

export type ExtractChildrenProps = HTMLAttributes<HTMLElement>

/**
 * Extracts all children of a parent component into its own component.
 */
export function ExtractChildren({
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

Object.defineProperty(ExtractChildren, 'displayName', { value: 'ExtractChildren', writable: false })
