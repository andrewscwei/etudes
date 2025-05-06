import clsx from 'clsx'
import { forwardRef, useCallback, type ChangeEvent, type FocusEvent, type InputHTMLAttributes } from 'react'

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'aria-disabled' | 'aria-placeholder' | 'aria-required' | 'disabled' | 'placeholder' | 'required' | 'type' | 'value' | 'onBlur' | 'onChange' | 'onFocus'> & {
  emptyValue?: string
  isDisabled?: boolean
  isRequired?: boolean
  placeholder?: string
  value?: string
  formatter?: (value: string) => string
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
  value,
  formatter,
  onFocus,
  onUnfocus,
  onChange,
  ...props
}, ref) => {
  const handleValueChange = useCallback((newValue: string) => {
    const formatted = (formatter?.(newValue) ?? newValue) || emptyValue

    onChange?.(formatted)
  }, [onChange, formatter])

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
      value={value || emptyValue}
      onBlur={({ target }: FocusEvent<HTMLInputElement>) => onUnfocus?.(target.value)}
      onChange={({ target }: ChangeEvent<HTMLInputElement>) => handleValueChange(target.value)}
      onFocus={({ target }: FocusEvent<HTMLInputElement>) => onFocus?.(target.value)}
    />
  )
})

TextField.displayName = 'TextField'
