import { type PropsWithChildren } from 'react'

export namespace Conditional {
  /**
   * Type describing the properties of {@link Conditional}.
   */
  export type Props = PropsWithChildren<{
    /**
     * An expression or function that returns a truthy value to determine if the
     * children should be rendered.
     */
    if: (() => any) | any
  }>
}

/**
 * Component for conditionally rendering children.
 */
export function Conditional({ children, if: functionOrTruthyExpression }: Readonly<Conditional.Props>) {
  switch (typeof functionOrTruthyExpression) {
    case 'function':
      return functionOrTruthyExpression() ? <>{children}</> : <></>
    default:
      return functionOrTruthyExpression ? <>{children}</> : <></>
  }
}

if (process.env.NODE_ENV === 'development') {
  Conditional.displayName = 'Conditional'
}
