import React, { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  if: boolean | (() => boolean)
}>

export default function Conditional({ children, if: boolOrExpression }: Props) {
  switch (typeof boolOrExpression) {
  case 'boolean':
    return boolOrExpression ? <>{children}</> : <></>
  case 'function':
    return boolOrExpression() ? <>{children}</> : <></>
  default:
    console.error(`[etudes::Conditional] The type of provided condition ${boolOrExpression} is not supported.`)
    return <></>
  }
}
