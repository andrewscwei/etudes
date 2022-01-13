import React, { Children, cloneElement, HTMLAttributes, isValidElement, PropsWithChildren } from 'react'

export default function ExtractChildren({ children, ...props }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <>
      {Children.map(children, child => {
        if (isValidElement(child)) return cloneElement(child, { ...props })
        return child
      })})
    </>
  )
}
