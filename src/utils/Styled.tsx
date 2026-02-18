import { type ComponentProps, type ElementType, type ReactElement, type ReactNode } from 'react'

import { cloneStyledElement } from './cloneStyledElement.js'

export type StyledProps<T extends ElementType> = {
  children?: ReactNode | ReactNode[]
  element: ReactElement<ComponentProps<T>, T>
} & ComponentProps<T>

export function Styled<T extends ElementType>({
  children,
  element,
  ...props
}: StyledProps<T>) {
  return cloneStyledElement(
    element,
    props as any,
    ...children ? (Array.isArray(children) ? children : [children]) : [],
  )
}

if (process.env.NODE_ENV === 'development') {
  Styled.displayName = 'Styled'
}
