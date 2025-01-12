import clsx from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'

export type SelectableButtonProps = HTMLAttributes<HTMLButtonElement> & {
  isDeselectable?: boolean
  isDisabled?: boolean
  isSelected?: boolean
  label?: string
  onDeselect?: () => void
  onSelect?: () => void
  onToggle?: (isSelected: boolean) => void
}

export const SelectableButton = forwardRef<HTMLButtonElement, SelectableButtonProps>(({
  children,
  className,
  isDeselectable = false,
  isDisabled = false,
  isSelected = false,
  label,
  onDeselect,
  onSelect,
  onToggle,
  ...props
}, ref) => {
  const onClick = () => {
    if (isDisabled) return

    if (isSelected) {
      if (!isDeselectable) return
      onToggle?.(isSelected)
      onDeselect?.()
    }
    else {
      onToggle?.(isSelected)
      onSelect?.()
    }
  }

  return (
    <button
      {...props}
      ref={ref}
      aria-disabled={isDisabled}
      aria-label={label}
      aria-selected={isSelected}
      className={clsx(className, { active: isSelected, disabled: isDisabled || (isSelected && !isDeselectable) })}
      disabled={isDisabled || (isSelected && !isDeselectable)}
      onClick={onClick}
    >
      {children ?? label}
    </button>
  )
})

Object.defineProperty(SelectableButton, 'displayName', { value: 'SelectableButton', writable: false })
