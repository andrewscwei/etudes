import clsx from 'clsx'
import { forwardRef, useEffect, type ComponentType, type HTMLAttributes } from 'react'
import { usePrevious } from '../hooks/usePrevious.js'
import { asStyleDict, styles } from '../utils/index.js'
import { TextField } from './TextField.js'

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
      ref={ref}
      data-component='counter'
      style={styles(style, FIXED_STYLES.root, defaultStyles?.root)}
    >
      {SubtractButtonComponent && (
        <SubtractButtonComponent
          className={clsx({ disabled: isSubtractingDisabled })}
          data-child='subtract-button'
          style={styles(FIXED_STYLES.subtract)}
          onClick={() => handleSubtract()}
        />
      ) || (
        <button
          className={clsx({ disabled: isSubtractingDisabled })}
          data-child='subtract-button'
          style={styles(FIXED_STYLES.subtract, defaultStyles?.subtract)}
          onClick={() => handleSubtract()}
        />
      )}
      <TextField
        data-child='text-field'
        formatter={(oldValue, newValue) => isNaN(Number(`0${newValue}`)) ? oldValue : newValue}
        isDisabled={!allowsInput}
        style={styles(FIXED_STYLES.text, defaultStyles?.text)}
        value={quantity.toString()}
      />
      {AddButtonComponent && (
        <AddButtonComponent
          className={clsx({ disabled: isAddingDisabled })}
          data-child='add-button'
          style={styles(FIXED_STYLES.add)}
          onClick={() => handleAdd()}
        />
      ) || (
        <button
          className={clsx({ disabled: isAddingDisabled })}
          data-child='add-button'
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
