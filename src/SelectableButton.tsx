import React, { HTMLAttributes, ReactNode, useEffect, useState } from 'react'
import styled from 'styled-components'

export type Props = Omit<HTMLAttributes<HTMLButtonElement>, 'children'> & {
  children?: (props: Pick<Props, 'isDeselectable' | 'isDisabled' | 'isSelected' | 'label'>) => ReactNode
  isDeselectable?: boolean
  isDisabled?: boolean
  isSelected?: boolean
  label?: string
  onDeselect?: () => void
  onSelect?: () => void
}

export default function SelectableButton({
  children,
  isDeselectable = false,
  isDisabled = false,
  isSelected: externalIsSelected = false,
  label,
  onDeselect,
  onSelect,
  ...props
}: Props) {
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
    <StyledRoot {...props} onClick={() => toggleSelection()} disabled={isDisabled || (isSelected && !isDeselectable)}>
      {children?.({ isDeselectable, isDisabled, isSelected, label }) ?? label}
    </StyledRoot>
  )
}

const StyledRoot = styled.button`
  &[disabled] {
    pointer-events: none;
  }
`
