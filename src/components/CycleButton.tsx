import { forwardRef, type HTMLAttributes } from 'react'

export type CycleButtonProps = Omit<HTMLAttributes<HTMLButtonElement>, 'disabled' | 'onChange'> & {
  index?: number
  isDisabled?: boolean
  options: string[] | { label: string; value: string }[]
  onChange?: (value: string, index: number) => void
}

export const CycleButton = forwardRef<HTMLButtonElement, CycleButtonProps>(({
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
      data-component='cycle-button'
      disabled={isDisabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
})

Object.defineProperty(CycleButton, 'displayName', { value: 'CycleButton', writable: false })
