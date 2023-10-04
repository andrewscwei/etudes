import React, { forwardRef, useEffect, useState, type ChangeEvent, type FocusEvent, type HTMLAttributes } from 'react'
import { usePrevious } from './hooks/usePrevious'
import { asStyleDict, styles } from './utils'

export type TextFieldProps = HTMLAttributes<HTMLInputElement> & {
  emptyValue?: string
  isDisabled?: boolean
  value?: string
  formatter?: (prevValue: string, newValue: string) => string
  onFocus?: (value: string) => void
  onUnfocus?: (value: string) => void
  onValueChange?: (value: string) => void
}

export const TextField = forwardRef<HTMLDivElement, TextFieldProps>(({
  style,
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
    <div
      {...props}
      data-component='text-field'
      ref={ref}
      style={style}
    >
      <input
        data-child='input'
        style={styles(FIXED_STYLES.input)}
        type='text'
        value={value}
        disabled={isDisabled}
        onBlur={({ target }: FocusEvent<HTMLInputElement>) => onUnfocus?.(target.value)}
        onChange={({ target }: ChangeEvent<HTMLInputElement>) => handleValueChange(target.value)}
        onFocus={({ target }: FocusEvent<HTMLInputElement>) => onFocus?.(target.value)}
      />
    </div>
  )
})

Object.defineProperty(TextField, 'displayName', { value: 'TextField', writable: false })

const FIXED_STYLES = asStyleDict({
  input: {
    width: '100%',
  },
})
