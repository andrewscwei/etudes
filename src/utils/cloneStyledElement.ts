import { cloneElement, type Attributes, type CElement, type ClassAttributes, type Component, type ComponentState, type FunctionComponentElement, type ReactElement, type ReactNode } from 'react'

/**
 * Wrapper for {@link cloneElement} but instead of overwriting `className` and
 * `style` of the cloned element with the values specified in the `props`
 * argument, they are merged instead.
 *
 * @param element - The target element to clone.
 * @param props - The props to apply to the cloned element. Overlapping props
 *                are overwritten with the exception of `className` and `style`,
 *                which are merged.
 * @param children - Optional child elements add into the cloned element.
 *
 * @returns The cloned element.
 */
function cloneStyledElement<P>(element: FunctionComponentElement<P>, props?: Partial<P> & Attributes, ...children: ReactNode[]): FunctionComponentElement<P>
function cloneStyledElement<P, T extends Component<P, ComponentState>>(element: CElement<P, T>, props?: Partial<P> & ClassAttributes<T>, ...children: ReactNode[]): CElement<P, T>
function cloneStyledElement<P>(element: ReactElement<P>, props?: Partial<P> & Attributes, ...children: ReactNode[]): ReactElement<P>
function cloneStyledElement<P, T extends Component<P, ComponentState> = never>(
  element: FunctionComponentElement<P> | CElement<P, T> | ReactElement<P>,
  props: Partial<P> & Attributes | Partial<P> & ClassAttributes<T> = {},
  ...children: ReactNode[]
) {
  const { className, style, ...otherProps } = props as any
  const elementProps = element.props as any

  return cloneElement(element, {
    className: `${elementProps.className ?? ''} ${className ?? ''}`.split(' ').filter(Boolean).join(' '),
    style: {
      ...elementProps.style ?? {},
      ...style ?? {},
    },
    ...otherProps,
  } as any, ...children)
}

export default cloneStyledElement
