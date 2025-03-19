import clsx from 'clsx'
import { forwardRef, useEffect, type ChangeEvent, type FocusEvent, type InputHTMLAttributes } from 'react'
import { usePrevious } from '../hooks/index.js'

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'aria-disabled' | 'aria-placeholder' | 'aria-required' | 'disabled' | 'placeholder' | 'required' | 'type' | 'value' | 'onBlur' | 'onChange' | 'onFocus'> & {
  emptyValue?: string
  isDisabled?: boolean
  isRequired?: boolean
  placeholder?: string
  value?: string
  formatter?: (prevValue: string, newValue: string) => string
  onFocus?: (value: string) => void
  onUnfocus?: (value: string) => void
  onChange?: (value: string) => void
}

export const TextField = /* #__PURE__ */ forwardRef<HTMLInputElement, Readonly<TextFieldProps>>(({
  className,
  emptyValue = '',
  isDisabled = false,
  isRequired = false,
  placeholder,
  value: externalValue,
  formatter,
  onFocus,
  onUnfocus,
  onChange,
  ...props
}, ref) => {
  const handleValueChange = (newValue: string) => {
    const formatted = (newValue !== emptyValue) ? (formatter?.(value, newValue) ?? newValue) : emptyValue

    if (formatted === value) return

    onChange?.(formatted)
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
      aria-disabled={isDisabled}
      aria-placeholder={placeholder}
      aria-required={isRequired}
      className={clsx(className, { disabled: isDisabled })}
      disabled={isDisabled}
      placeholder={placeholder}
      required={isRequired}
      type='text'
      value={value}
      onBlur={({ target }: FocusEvent<HTMLInputElement>) => onUnfocus?.(target.value)}
      onChange={({ target }: ChangeEvent<HTMLInputElement>) => handleValueChange(target.value)}
      onFocus={({ target }: FocusEvent<HTMLInputElement>) => onFocus?.(target.value)}
    />
  )
})
