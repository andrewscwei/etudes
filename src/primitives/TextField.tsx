import clsx from 'clsx'
import { type ChangeEvent, type FocusEvent, type HTMLInputTypeAttribute, type InputHTMLAttributes, type Ref, type RefObject, useCallback, useEffect, useRef } from 'react'

export namespace TextField {
  /**
   * Type describing the props of {@link TextField}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLInputElement>

    /**
     * Specifies if the text field should be focused when it is mounted.
     */
    autoFocus?: boolean

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
    formatValue?: (value: string) => string

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
  } & Omit<InputHTMLAttributes<HTMLInputElement>, 'aria-disabled' | 'aria-placeholder' | 'aria-required' | 'autoFocus' | 'disabled' | 'onBlur' | 'onChange' | 'onFocus' | 'placeholder' | 'required' | 'type' | 'value'>
}

/**
 * A text field that supports custom value formatting and empty value.
 */
export function TextField({
  className,
  ref,
  autoFocus = false,
  emptyValue = '',
  placeholder,
  type = 'text',
  value,
  isDisabled = false,
  isRequired = false,
  formatValue,
  onChange,
  onFocus,
  onUnfocus,
  ...props
}: TextField.Props) {
  const rootRef = ref as RefObject<HTMLInputElement> ?? useRef<HTMLInputElement>(null)

  const handleValueChange = useCallback((newValue: string) => {
    const formatted = (formatValue?.(newValue) ?? newValue) || emptyValue

    onChange?.(formatted)
  }, [onChange, formatValue])

  useEffect(() => {
    if (!autoFocus) return

    const element = rootRef.current
    if (!element) return

    const timeoutId = setTimeout(() => {
      const length = element.value.length
      element.focus({ preventScroll: true })
      element.setSelectionRange(length, length)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [autoFocus])

  return (
    <input
      {...props}
      {...isDisabled ? { 'aria-disabled': true } : {}}
      className={clsx(className, { disabled: isDisabled })}
      ref={rootRef}
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
}

if (process.env.NODE_ENV === 'development') {
  TextField.displayName = 'TextField'
}
