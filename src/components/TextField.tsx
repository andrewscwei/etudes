import { forwardRef, useEffect, type ChangeEvent, type FocusEvent, type HTMLAttributes } from 'react'
import { usePrevious } from '../hooks/usePrevious'

export type TextFieldProps = HTMLAttributes<HTMLInputElement> & {
  emptyValue?: string
  isDisabled?: boolean
  placeholder?: string
  value?: string
  formatter?: (prevValue: string, newValue: string) => string
  onFocus?: (value: string) => void
  onUnfocus?: (value: string) => void
  onValueChange?: (value: string) => void
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
  emptyValue = '',
  isDisabled = false,
  placeholder,
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

    onValueChange?.(formatted)
  }

  const value = externalValue ?? emptyValue
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
      disabled={isDisabled}
      placeholder={placeholder}
      type='text'
      value={value}
      onBlur={({ target }: FocusEvent<HTMLInputElement>) => onUnfocus?.(target.value)}
      onChange={({ target }: ChangeEvent<HTMLInputElement>) => handleValueChange(target.value)}
      onFocus={({ target }: FocusEvent<HTMLInputElement>) => onFocus?.(target.value)}
    />
  )
})

Object.defineProperty(TextField, 'displayName', { value: 'TextField', writable: false })
