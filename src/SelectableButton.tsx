import React, { forwardRef, useEffect, useState, type HTMLAttributes, type ReactNode } from 'react'

export type SelectableButtonProps = Omit<HTMLAttributes<HTMLButtonElement>, 'children'> & {
  children?: (props: Pick<SelectableButtonProps, 'isDeselectable' | 'isDisabled' | 'isSelected' | 'label'>) => ReactNode
  isDeselectable?: boolean
  isDisabled?: boolean
  isSelected?: boolean
  label?: string
  onDeselect?: () => void
  onSelect?: () => void
}

export const SelectableButton = forwardRef<HTMLButtonElement, SelectableButtonProps>(({
  children,
  isDeselectable = false,
  isDisabled = false,
  isSelected: externalIsSelected = false,
  label,
  onDeselect,
  onSelect,
  ...props
}, ref) => {
  const [isSelected, setIsSelected] = useState(externalIsSelected)

  const toggleSelection = () => {
    if (isDisabled) return

    if (isSelected) {
      if (!isDeselectable) return
      setIsSelected(false)
      onDeselect?.()
    }
    else {
      setIsSelected(true)
      onSelect?.()
    }
  }

  useEffect(() => {
    setIsSelected(externalIsSelected)
  }, [externalIsSelected])

  return (
    <button
      {...props}
      ref={ref}
      onClick={() => toggleSelection()} disabled={isDisabled || isSelected && !isDeselectable}
    >
      {children?.({ isDeselectable, isDisabled, isSelected, label }) ?? label}
    </button>
  )
})

Object.defineProperty(SelectableButton, 'displayName', { value: 'SelectableButton', writable: false })
