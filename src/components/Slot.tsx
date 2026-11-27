import { Children, type HTMLAttributes, isValidElement, type Ref } from 'react'

import { cloneStyledElement } from '../utils/cloneStyledElement.js'

/**
 * Type describing the properties of {@link Slot}.
 */
export type SlotProps = { ref?: Ref<HTMLElement> } & HTMLAttributes<HTMLElement>

/**
 * Merges its props (including `ref`) into its single child. If there are
 * multiple children, only the first one is rendered and the rest are
 * discarded.
 */
export function Slot({
  ref,
  children,
  ...props
}: SlotProps) {
  if (Array.isArray(children)) {
    console.error(`[etudes::Slot] Only one child is expected, but found ${children.length}. Only the first child is rendered while the rest are discarded.`)
  }

  return Children.map(children, (child, idx) => {
    if (idx > 0) {
      return undefined
    } else if (isValidElement(child)) {
      return cloneStyledElement(child, { ...props, ref } as any)
    } else {
      return child
    }
  })
}

if (process.env.NODE_ENV === 'development') {
  Slot.displayName = 'Slot'
}
