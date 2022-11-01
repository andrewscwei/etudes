import React, { ChangeEvent, FocusEvent, forwardRef, HTMLAttributes } from 'react'

export type Props = HTMLAttributes<HTMLInputElement> & {
  value?: string
  onFocus?: (value: string) => void
  onUnfocus?: (value: string) => void
  onValueChange?: (value: string) => void
}

export default forwardRef<HTMLInputElement, Props>(({
  value = '',
  onFocus,
  onUnfocus,
  onValueChange,
  ...props
}, ref) => (
  <input
    {...props}
    ref={ref}
    type='text'
    value={value}
    onBlur={({ target }: FocusEvent<HTMLInputElement>) => onUnfocus?.(target.value)}
    onChange={({ target }: ChangeEvent<HTMLInputElement>) => onValueChange?.(target.value)}
    onFocus={({ target }: FocusEvent<HTMLInputElement>) => onFocus?.(target.value)}
  />
))
