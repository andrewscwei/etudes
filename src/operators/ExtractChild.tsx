import { Children, forwardRef, isValidElement, type HTMLAttributes } from 'react'
import { cloneStyledElement } from '../utils/cloneStyledElement.js'

/**
 * Type describing the properties of {@link ExtractChild}.
 */
export type ExtractChildProps = HTMLAttributes<HTMLElement>

/**
 * Extracts a single child of a parent component into its own component. If the
 * parent component has multiple children, only the first one will be extracted,
 * the rest will be ignored.
 */
export const ExtractChild = /* #__PURE__ */ forwardRef<HTMLElement, Readonly<ExtractChildProps>>(({
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

if (process.env.NODE_ENV !== 'production') {
  ExtractChild.displayName = 'ExtractChild'
}
