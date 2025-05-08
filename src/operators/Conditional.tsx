import { type PropsWithChildren } from 'react'

/**
 * Type describing the properties of {@link Conditional}.
 */
export type ConditionalProps = PropsWithChildren<{
  /**
   * An expression or function that returns a truthy value to determine if the
   * children should be rendered.
   */
  if: any | (() => any)
}>

/**
 * Component for conditionally rendering children.
 */
export function Conditional({ children, if: functionOrTruthyExpression }: Readonly<ConditionalProps>) {
  switch (typeof functionOrTruthyExpression) {
    case 'function':
      return functionOrTruthyExpression() ? <>{children}</> : <></>
    default:
      return functionOrTruthyExpression ? <>{children}</> : <></>
  }
}

if (process.env.NODE_ENV !== 'production') {
  Conditional.displayName = 'Conditional'
}
