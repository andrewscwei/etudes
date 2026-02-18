import clsx from 'clsx'
import { type ChangeEvent, type FocusEvent, forwardRef, type HTMLInputTypeAttribute, type InputHTMLAttributes, useCallback } from 'react'

export namespace TextField {
  /**
   * Type describing the props of {@link TextField}.
   */
  export type Props = {
    /**
     * The value to set to when the text field is empty.
     */
    emptyValue?: string

    /**
     * Specifies if the text field is disabled.
     */
    isDisabled?: boolean

    /**
     * Specifies if the text field is required.
     */
    isRequired?: boolean

    /**
     * The placeholder text to display when the text field is empty.
     */
    placeholder?: string

    /**
     * The type of the text field.
     */
    type?: Extract<HTMLInputTypeAttribute, 'email' | 'password' | 'search' | 'tel' | 'text' | 'url'>

    /**
     * The value of the text field.
     */
    value?: string

    /**
     * A function that formats the value of the text field.
     *
     * @param value The value to format.
     *
     * @returns The formatted value.
     */
    formatter?: (value: string) => string

    /**
     * Handler invoked the text field is focused.
     *
     * @param value The value of the text field.
     */
    onFocus?: (value: string) => void

    /**
     * Handler invoked the text field is out of focus.
     *
     * @param value The value of the text field.
     */
    onUnfocus?: (value: string) => void

    /**
     * Handler invoked when the value of the text field changes.
     *
     * @param value The new value of the text field.
     */
    onChange?: (value: string) => void
  } & Omit<InputHTMLAttributes<HTMLInputElement>, 'aria-disabled' | 'aria-placeholder' | 'aria-required' | 'disabled' | 'onBlur' | 'onChange' | 'onFocus' | 'placeholder' | 'required' | 'type' | 'value'>
}

/**
 * A text field that supports custom value formatting and empty value.
 */
export const TextField = /* #__PURE__ */ forwardRef<HTMLInputElement, Readonly<TextField.Props>>((
  {
    className,
    emptyValue = '',
    formatter,
    placeholder,
    type = 'text',
    value,
    isDisabled = false,
    isRequired = false,
    onChange,
    onFocus,
    onUnfocus,
    ...props
  },
  ref,
) => {
  const handleValueChange = useCallback((newValue: string) => {
    const formatted = (formatter?.(newValue) ?? newValue) || emptyValue

    onChange?.(formatted)
  }, [onChange, formatter])

  return (
    <input
      {...props}
      {...isDisabled ? { 'aria-disabled': true } : {}}
      className={clsx(className, { disabled: isDisabled })}
      ref={ref}
      aria-placeholder={placeholder}
      aria-required={isRequired}
      disabled={isDisabled}
      placeholder={placeholder}
      required={isRequired}
      type={type}
      value={value || emptyValue}
      onBlur={({ target }: FocusEvent<HTMLInputElement>) => onUnfocus?.(target.value)}
      onChange={({ target }: ChangeEvent<HTMLInputElement>) => handleValueChange(target.value)}
      onFocus={({ target }: FocusEvent<HTMLInputElement>) => onFocus?.(target.value)}
    />
  )
})

if (process.env.NODE_ENV === 'development') {
  TextField.displayName = 'TextField'
}
