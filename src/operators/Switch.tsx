import { Children, isValidElement, type PropsWithChildren, type ReactElement } from 'react'

/**
 * Type describing the properties of {@link Switch}.
 */
export type SwitchProps<T> = PropsWithChildren<{
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

/**
 * A component that renders one of its children based on the provided condition.
 * It is used to create a switch-case-like structure in React.
 *
 * @exports Case A component that represents a case in a {@link Switch}.
 * @exports Default A component that represents the default case in a
 *                  {@link Switch}.
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
export function Switch<T>({
  children,
  condition,
}: SwitchProps<T>) {
  const childrenArray = Children.toArray(children)

  if (childrenArray.length === 0) throw Error('`Switch` must have at least one child')
  if (!childrenIsValidElement<T>(childrenArray)) throw Error('`Switch` children must be of `Case` type or `Default` type')

  const defaultChildren = childrenArray.filter(child => child.type === Default)

  if (defaultChildren.length > 1) throw Error('`Switch` can only have maximum one `Default` child')

  const defaultChild = defaultChildren[0]

  for (const child of childrenArray) {
    if (typeof condition === 'function') {
      if ((condition as (value: T) => boolean)((child.props as CaseProps<T>).value)) {
        return child
      }
    }
    else if (condition === (child.props as CaseProps<T>).value) {
      return child
    }
  }

  if (defaultChild) {
    return defaultChild
  }
}

/**
 * A component that represents a case in a {@link Switch} component. It is used
 * to define a specific condition and the content to render if that condition is
 * met.
 */
export function Case<T>({ children }: CaseProps<T>) {
  return children
}

/**
 * A component that represents the default case in a {@link Switch} component.
 * It is used to define the content to render if none of the cases match the
 * provided condition.
 */
export function Default({ children }: DefaultProps) {
  return children
}

function childrenIsValidElement<T>(children: ReturnType<typeof Children.toArray>): children is ReactElement[] {
  return children.every(child => isValidElement(child) && (child.type === Case<T> || child.type === Default))
}
