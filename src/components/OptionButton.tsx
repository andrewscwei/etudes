import { forwardRef, type ButtonHTMLAttributes } from 'react'

export type CycleButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-disabled' | 'aria-label' | 'disabled' | 'onChange'> & {
  index?: number
  isDisabled?: boolean
  options: string[] | { label: string; value: string }[]
  onChange?: (value: string, index: number) => void
}

export const OptionButton = /* #__PURE__ */ forwardRef<HTMLButtonElement, Readonly<CycleButtonProps>>(({
  index = 0,
  isDisabled = false,
  options,
  onChange,
  ...props
}, ref) => {
  const maxIndex = options.length - 1
  const option = options[index]
  const label = typeof option === 'string' ? option : option?.label

  const onClick = () => {
    if (isDisabled) return

    const nextIndex = index < maxIndex ? index + 1 : 0
    const nextOption = options[nextIndex]
    const nextValue = typeof nextOption === 'string' ? nextOption : nextOption?.value

    onChange?.(nextValue, nextIndex)
  }

  return (
    <button
      {...props}
      ref={ref}
      aria-disabled={isDisabled}
      aria-label={label}
      disabled={isDisabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
})

OptionButton.displayName = 'OptionButton'
