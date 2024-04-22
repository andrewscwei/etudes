import clsx from 'clsx'
import React, { forwardRef, useEffect, type ComponentType, type HTMLAttributes } from 'react'
import { usePrevious } from '../hooks/usePrevious'
import { asStyleDict } from '../utils/asStyleDict'
import { styles } from '../utils/styles'
import { TextField } from './TextField'

type Props = Omit<HTMLAttributes<HTMLElement>, 'onChange'> & {
  min?: number
  max?: number
  quantity?: number
  allowsInput?: boolean
  usesDefaultStyles?: boolean
  onChange?: (quantity: number) => void
  AddButtonComponent?: ComponentType<HTMLAttributes<HTMLElement>>
  SubtractButtonComponent?: ComponentType<HTMLAttributes<HTMLElement>>
}

export const Counter = forwardRef<HTMLDivElement, Props>(({
  style,
  min = NaN,
  max = NaN,
  allowsInput = true,
  quantity = 0,
  usesDefaultStyles = true,
  onChange,
  AddButtonComponent,
  SubtractButtonComponent,
  ...props
}, ref) => {
  const handleSubtract = () => {
    onChange?.(isNaN(min) ? quantity - 1 : Math.max(min, quantity - 1))
  }

  const handleAdd = () => {
    onChange?.(isNaN(max) ? quantity + 1 : Math.min(max, quantity + 1))
  }

  const handleQuantityChange = (newValue: number) => {
    if (newValue === quantity) return

    onChange?.(newValue)
  }

  const prevQuantity = usePrevious(quantity)
  const defaultStyles = usesDefaultStyles ? DEFAULT_STYLES : undefined
  const isAddingDisabled = !isNaN(max) && quantity + 1 > max
  const isSubtractingDisabled = !isNaN(min) && quantity - 1 < min

  useEffect(() => {
    if (prevQuantity === undefined) return

    handleQuantityChange(quantity)
  }, [quantity])

  useEffect(() => {
    handleQuantityChange(isNaN(min) ? quantity : Math.max(min, quantity))
  }, [min])

  useEffect(() => {
    if (isNaN(max)) return

    handleQuantityChange(isNaN(max) ? quantity : Math.min(max, quantity))
  }, [max])

  return (
    <div
      {...props}
      data-component='counter'
      ref={ref}
      style={styles(style, FIXED_STYLES.root, defaultStyles?.root)}
    >
      {SubtractButtonComponent && (
        <SubtractButtonComponent
          data-child='subtract-button'
          className={clsx({ disabled: isSubtractingDisabled })}
          style={styles(FIXED_STYLES.subtract)}
          onClick={() => handleSubtract()}
        />
      ) || (
        <button
          data-child='subtract-button'
          className={clsx({ disabled: isSubtractingDisabled })}
          style={styles(FIXED_STYLES.subtract, defaultStyles?.subtract)}
          onClick={() => handleSubtract()}
        />
      )}
      <TextField
        data-child='text-field'
        value={quantity.toString()}
        isDisabled={!allowsInput}
        formatter={(oldValue, newValue) => isNaN(Number(`0${newValue}`)) ? oldValue : newValue }
        style={styles(FIXED_STYLES.text, defaultStyles?.text)}
      />
      {AddButtonComponent && (
        <AddButtonComponent
          data-child='add-button'
          className={clsx({ disabled: isAddingDisabled })}
          style={styles(FIXED_STYLES.add)}
          onClick={() => handleAdd()}
        />
      ) || (
        <button
          data-child='add-button'
          className={clsx({ disabled: isAddingDisabled })}
          style={styles(FIXED_STYLES.add, defaultStyles?.add)}
          onClick={() => handleAdd()}
        />
      )}
    </div>
  )
})

Object.defineProperty(Counter, 'displayName', { value: 'Counter', writable: false })

const FIXED_STYLES = asStyleDict({
  root: styles({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  }),
  subtract: styles({
    flex: '0 0 auto',
  }),
  add: styles({
    flex: '0 0 auto',
  }),
  text: styles({
    flex: '1 1 auto',
  }),
})

const DEFAULT_STYLES = asStyleDict({
  root: styles({

  }),
  subtract: styles({
    width: '20px',
    height: '100%',
    background: '#000',
  }),
  add: styles({
    width: '20px',
    height: '100%',
    background: '#000',
  }),
  text: styles({
    height: '100%',
  }),
})
