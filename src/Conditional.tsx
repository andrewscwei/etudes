import React, { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  if: boolean | (() => boolean)
}>

export default function Conditional({ children, if: boolOrExpression }: Props) {
  if (typeof boolOrExpression === 'boolean' && boolOrExpression === true) return <>{children}</>
  if (typeof boolOrExpression === 'function' && boolOrExpression() === true) return <>{children}</>
  console.error(`[etudes::Conditional] The type of provided condition ${boolOrExpression} is not supported.`)
  return <></>
}
