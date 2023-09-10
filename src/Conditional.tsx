import React, { type PropsWithChildren } from 'react'

export type ConditionalProps = PropsWithChildren<{
  if: boolean | (() => boolean)
}>

export default function Conditional({ children, if: boolOrExpression }: ConditionalProps) {
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
