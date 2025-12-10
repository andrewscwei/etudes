import { Children, isValidElement, type PropsWithChildren, type ReactElement } from 'react'

function _Switch<T>({
  children,
  condition,
}: Switch.Props<T>) {
  const childrenArray = Children.toArray(children)

  if (childrenArray.length === 0) {
    console.error('[etudes::Switch] `Switch` must have at least one child')

    return (<></>)
  }

  if (!_childrenIsValidElement<T>(childrenArray)) {
    console.error('[etudes::Switch] `Switch` children must be of `Case` type or `Default` type')

    return (<></>)
  }

  const defaultChildren = childrenArray.filter(child => child.type === _Default)

  if (defaultChildren.length > 1) {
    console.error('[etudes::Switch] `Switch` can only have maximum one `Default` child')

    return (<></>)
  }

  const defaultChild = defaultChildren[0]

  for (const child of childrenArray) {
    if (typeof condition === 'function') {
      if ((condition as (value: T) => boolean)((child.props as Switch.CaseProps<T>).value)) {
        return child
      }
    }
    else if (condition === (child.props as Switch.CaseProps<T>).value) {
      return child
    }
  }

  if (defaultChild) {
    return defaultChild
  }
}

function _Case<T>({ children }: Switch.CaseProps<T>) {
  return children
}

function _Default({ children }: Switch.DefaultProps) {
  return children
}

export namespace Switch {
  /**
   * Type describing the properties of {@link Switch}.
   */
  export type Props<T> = PropsWithChildren<{
    /**
     * The condition to evaluate. If it's a function, it will be called with the
     * value of each `Case` child. If it's a value, it will be compared with the
     * `value` prop of each `Case` child.
     */
    condition: T | ((value: T) => boolean)
  }>

  /**
   * Type describing the properties of {@link Case}.
   */
  export type CaseProps<T> = PropsWithChildren<{
    /**
     * The value to compare with the `condition` prop of the `Switch` component.
     */
    value: T
  }>

  /**
   * Type describing the properties of {@link Default}.
   */
  export type DefaultProps = PropsWithChildren
}

/**
 * A component that renders one of its children based on the provided condition.
 * It is used to create a switch-case-like structure in React.
 *
 * @exports Switch.Case A component that represents a case in a {@link Switch}.
 * @exports Switch.Default A component that represents the default case in a
 *                         {@link Switch}.
 *
 * @example
 * ```tsx
 * <Switch condition={someValue}>
 *   <Case value="case1">Case 1</Case>
 *   <Case value="case2">Case 2</Case>
 *   <Default>Default case</Default>
 * </Switch>
 * ```
 */
export const Switch = /* #__PURE__*/ Object.assign(_Switch, {
  /**
   * A component that represents a case in a {@link Switch} component. It is
   * used to define a specific condition and the content to render if that
   * condition is met.
   */
  Case: _Case,

  /**
   * A component that represents the default case in a {@link Switch} component.
   * It is used to define the content to render if none of the cases match the
   * provided condition.
   */
  Default: _Default,
})

function _childrenIsValidElement<T>(children: ReturnType<typeof Children.toArray>): children is ReactElement[] {
  return children.every(child => isValidElement(child) && (child.type === _Case<T> || child.type === _Default))
}

if (process.env.NODE_ENV === 'development') {
  _Switch.displayName = 'Switch'
  _Case.displayName = 'Switch.Case'
  _Default.displayName = 'Switch.Default'
}
