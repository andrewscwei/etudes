import React, { forwardRef, useEffect, useState, type ChangeEvent, type FocusEvent, type HTMLAttributes } from 'react'
import { usePrevious } from '../hooks/usePrevious'

export type TextFieldProps = HTMLAttributes<HTMLInputElement> & {
  emptyValue?: string
  isDisabled?: boolean
  value?: string
  formatter?: (prevValue: string, newValue: string) => string
  onFocus?: (value: string) => void
  onUnfocus?: (value: string) => void
  onValueChange?: (value: string) => void
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
  emptyValue = '',
  isDisabled = false,
  value: externalValue,
  formatter,
  onFocus,
  onUnfocus,
  onValueChange,
  ...props
}, ref) => {
  const handleValueChange = (newValue: string) => {
    const formatted = (newValue !== emptyValue) ? (formatter?.(value, newValue) ?? newValue) : emptyValue

    if (formatted === value) return

    if (setValue) {
      setValue(formatted)
    }
    else {
      onValueChange?.(formatted)
    }
  }

  const tracksChanges = externalValue === undefined
  const [value, setValue] = tracksChanges ? useState(emptyValue) : [externalValue]
  const prevValue = usePrevious(value)

  useEffect(() => {
    if (prevValue === undefined) return

    handleValueChange(value)
  }, [value])

  return (
    <input
      {...props}
      ref={ref}
      data-component='text-field'
      type='text'
      value={value}
      disabled={isDisabled}
      onBlur={({ target }: FocusEvent<HTMLInputElement>) => onUnfocus?.(target.value)}
      onChange={({ target }: ChangeEvent<HTMLInputElement>) => handleValueChange(target.value)}
      onFocus={({ target }: FocusEvent<HTMLInputElement>) => onFocus?.(target.value)}
    />
  )
})

Object.defineProperty(TextField, 'displayName', { value: 'TextField', writable: false })
