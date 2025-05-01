import { type PropsWithChildren } from 'react'

export type ConditionalProps = PropsWithChildren<{
  if: any | (() => any)
}>

export function Conditional({ children, if: functionOrTruthyExpression }: Readonly<ConditionalProps>) {
  switch (typeof functionOrTruthyExpression) {
    case 'function':
      return functionOrTruthyExpression() ? <>{children}</> : <></>
    default:
      return functionOrTruthyExpression ? <>{children}</> : <></>
  }
}
