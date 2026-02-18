import { type ButtonHTMLAttributes, forwardRef, useCallback } from 'react'

import { Button } from '../primitives/Button.js'

export namespace OptionButton {
  /**
   * Type describing the props of {@link OptionButton}.
   */
  export type Props = {
    /**
     * The current index of the option.
     */
    index?: number

    /**
     * Specifies if the button is disabled.
     */
    isDisabled?: boolean

    /**
     * The list of options to cycle through.
     */
    options: { label: string; value: string }[] | string[]

    /**
     * Handler invoked when the button is clicked.
     *
     * @param value The value of the next option.
     * @param index The index of the next option.
     */
    onChange?: (value: string, index: number) => void
  } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-disabled' | 'aria-label' | 'disabled' | 'onChange'>
}

/**
 * A button component that cycles through a list of options when clicked.
 */
export const OptionButton = /* #__PURE__ */ forwardRef<HTMLButtonElement, Readonly<OptionButton.Props>>(({
  index = 0,
  options,
  isDisabled = false,
  onChange,
  ...props
}, ref) => {
  const maxIndex = options.length - 1
  const option = options[index]
  const label = typeof option === 'string' ? option : option?.label

  const action = useCallback(() => {
    if (isDisabled) return

    const nextIndex = index < maxIndex ? index + 1 : 0
    const nextOption = options[nextIndex]
    const nextValue = typeof nextOption === 'string' ? nextOption : nextOption?.value

    onChange?.(nextValue, nextIndex)
  }, [maxIndex, isDisabled, index, options, onChange])

  return (
    <Button
      {...props}
      ref={ref}
      action={action}
      label={label}
      isDisabled={isDisabled}
    />
  )
})

if (process.env.NODE_ENV === 'development') {
  OptionButton.displayName = 'OptionButton'
}
