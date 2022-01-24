import React, { ChangeEvent, FocusEvent, forwardRef, HTMLAttributes } from 'react'
import styled from 'styled-components'

type Props = HTMLAttributes<HTMLInputElement> & {
  value?: string
  onFocus?: (value: string) => void
  onUnfocus?: (value: string) => void
  onValueChange?: (value: string) => void
}

export default forwardRef<HTMLInputElement, Props>(({
  value = '',
  onFocus,
  onUnfocus,
  onValueChange,
  ...props
}, ref) => (
  <StyledRoot
    {...props}
    ref={ref}
    type='text'
    onChange={({ target }: ChangeEvent<HTMLInputElement>) => onValueChange?.(target.value)}
    onFocus={({ target }: FocusEvent<HTMLInputElement>) => onFocus?.(target.value)}
    onBlur={({ target }: FocusEvent<HTMLInputElement>) => onUnfocus?.(target.value)}
    value={value}
  />
))

const StyledRoot = styled.input`
  background: #fff;
  box-sizing: border-box;
  color: #000;
  display: block;
  height: 40px;
  padding: 0 1rem;
  text-align: left;
  width: 100px;
`
