import { cloneElement, type Attributes, type ClassAttributes, type Component, type ComponentClass, type ComponentState, type FunctionComponent, type ReactElement, type ReactNode } from 'react'

/**
 * Wrapper for {@link cloneElement} but instead of overwriting `className` and
 * `style` of the cloned element with the values specified in the `props`
 * argument, they are merged.
 *
 * @param element The target element to clone.
 * @param props The props to apply to the cloned element. Overlapping props are
 *              overwritten with the exception of `className` and `style`, which
 *              are merged.
 * @param children Optional child elements add into the cloned element.
 *
 * @returns The cloned element.
 */
export function cloneStyledElement<P>(element: ReactElement<P, FunctionComponent<P>>, props?: Partial<P> & Attributes, ...children: ReactNode[]): ReactElement<P, FunctionComponent<P>>
export function cloneStyledElement<P, T extends Component<P, ComponentState>>(element: ReactElement<P, ComponentClass<T>>, props?: Partial<P> & ClassAttributes<T>, ...children: ReactNode[]): ReactElement<P, ComponentClass<T>>
export function cloneStyledElement<P>(element: ReactElement<P>, props?: Partial<P> & Attributes, ...children: ReactNode[]): ReactElement<P>
export function cloneStyledElement<P, T extends Component<P, ComponentState> = never>(
  element: ReactElement<P, FunctionComponent<P>> | ReactElement<P, ComponentClass<T>> | ReactElement<P>,
  props: Partial<P> & Attributes | Partial<P> & ClassAttributes<T> = {},
  ...children: ReactNode[]
) {
  const { className, style, ...otherProps } = props as any
  const { className: elementClassName, style: elementStyle, ...otherElementProps } = element.props as any

  return cloneElement(element, {
    className: `${elementClassName ?? ''} ${className ?? ''}`.split(' ').filter(Boolean).join(' ') || undefined,
    style: {
      ...elementStyle ?? {},
      ...style ?? {},
    },
    ...otherElementProps,
    ...otherProps,
  }, ...children)
}
