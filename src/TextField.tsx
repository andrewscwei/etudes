import React, { forwardRef, type ChangeEvent, type FocusEvent, type HTMLAttributes } from 'react'

export type TextFieldProps = HTMLAttributes<HTMLInputElement> & {
  value?: string
  onFocus?: (value: string) => void
  onUnfocus?: (value: string) => void
  onValueChange?: (value: string) => void
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
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

Object.defineProperty(TextField, 'displayName', { value: 'TextField', writable: false })

export default TextField
