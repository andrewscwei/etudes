import clsx from 'clsx'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

export namespace SelectableButton {
  /**
   * Type describing the props of {@link SelectableButton}.
   */
  export type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-disabled' | 'aria-label' | 'aria-selected' | 'disabled' | 'onClick' | 'onSelect' | 'onToggle'> & {
    /**
     * Specifies if the button can be deselected.
     */
    isDeselectable?: boolean

    /**
     * Specifies if the button is disabled.
     */
    isDisabled?: boolean

    /**
     * Specifies if the button is selected.
     */
    isSelected?: boolean

    /**
     * The label of the button.
     */
    label?: string

    /**
     * Handler invoked when the button is deselected.
     */
    onDeselect?: () => void

    /**
     * Handler invoked when the button is selected.
     */
    onSelect?: () => void

    /**
     * Handler invoked when the button's selected state is toggled.
     *
     * @param isSelected The new selected state of the button.
     */
    onToggle?: (isSelected: boolean) => void
  }
}

/**
 * A button component that can be selected or deselected.
 */
export const SelectableButton = /* #__PURE__ */ forwardRef<HTMLButtonElement, Readonly<SelectableButton.Props>>(({
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

if (process.env.NODE_ENV === 'development') {
  SelectableButton.displayName = 'SelectableButton'
}
