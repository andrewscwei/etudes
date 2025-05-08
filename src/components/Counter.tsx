import clsx from 'clsx'
import { forwardRef, useEffect, useState, type HTMLAttributes } from 'react'
import { usePrevious } from '../hooks/usePrevious.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { cloneStyledElement } from '../utils/cloneStyledElement.js'
import { styles } from '../utils/styles.js'
import { TextField, type TextFieldProps } from './TextField.js'

/**
 * Type describing the props of {@link Counter}.
 */
export type CounterProps = Omit<HTMLAttributes<HTMLElement>, 'onChange'> & {
  min?: number
  max?: number
  quantity?: number
  allowsInput?: boolean
  onChange?: (quantity: number) => void
}

/**
 * A component that allows the user to increment or decrement a quantity
 * using buttons or by typing in a text field.
 *
 * @exports CounterTextField Component for the text field.
 * @exports CounterAddButton Component for the add button.
 * @exports CounterSubtractButton Component for the subtract button.
 */
export const Counter = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<CounterProps>>(({
  children,
  style,
  allowsInput = true,
  max = NaN,
  min = NaN,
  quantity = 0,
  onChange,
  ...props
}, ref) => {
  const handleSubtract = () => {
    onChange?.(clamp(quantity - 1))
  }

  const handleAdd = () => {
    onChange?.(clamp(quantity + 1))
  }

  const handleInputProgress = (value: string) => {
    setText(value)
  }

  const handleInputComplete = (value: string) => {
    const newQuantity = toQuantity(value)

    if (newQuantity !== quantity) {
      onChange?.(newQuantity)
    }
    else {
      setText(toString(newQuantity))
    }
  }

  const toString = (qty: number) => {
    return qty.toLocaleString()
  }

  const toQuantity = (text: string) => {
    const out = parseInt(text, 10)
    if (out.toString() !== text.replace(/^0+/, '')) return quantity

    return clamp(out)
  }

  const clamp = (qty: number) => {
    let out = qty

    if (!isNaN(min)) out = Math.max(min, out)
    if (!isNaN(max)) out = Math.min(max, out)

    return out
  }

  const [text, setText] = useState(toString(quantity))
  const prevQuantity = usePrevious(quantity)
  const isAddingDisabled = !isNaN(max) && quantity + 1 > max
  const isSubtractingDisabled = !isNaN(min) && quantity - 1 < min

  useEffect(() => {
    if (prevQuantity === undefined || prevQuantity === quantity) return

    const value = clamp(quantity)

    setText(toString(value))
  }, [quantity, min, max])

  const components = asComponentDict(children, {
    textField: CounterTextField,
    addButton: CounterAddButton,
    subscribeButton: CounterSubtractButton,
  })

  return (
    <div {...props} ref={ref} style={styles(style, FIXED_STYLES.root)}>
      {cloneStyledElement(
        components.subscribeButton ?? <CounterSubtractButton/>,
        {
          className: clsx({ disabled: isSubtractingDisabled }),
          style: styles(FIXED_STYLES.subtract),
          onClick: () => handleSubtract(),
        },
      )}
      {cloneStyledElement(
        components.textField ?? <CounterTextField/>,
        {
          isDisabled: !allowsInput,
          style: styles(FIXED_STYLES.text),
          value: text,
          onChange: handleInputProgress,
          onUnfocus: handleInputComplete,
        },
      )}
      {cloneStyledElement(
        components.addButton ?? <CounterAddButton/>,
        {
          className: clsx({ disabled: isAddingDisabled }),
          style: styles(FIXED_STYLES.add),
          onClick: () => handleAdd(),
        },
      )}
    </div>
  )
})

/**
 * Component for the text field in a {@link Counter}.
 */
export const CounterTextField = ({ ...props }: TextFieldProps) => (
  <TextField {...props}/>
)

/**
 * Component for the add button in a {@link Counter}.
 */
export const CounterAddButton = ({ children, ...props }: HTMLAttributes<HTMLButtonElement>) => (
  <button {...props}>
    {children}
  </button>
)

/**
 * Component for the subtract button in a {@link Counter}.
 */
export const CounterSubtractButton = ({ children, ...props }: HTMLAttributes<HTMLButtonElement>) => (
  <button {...props}>
    {children}
  </button>
)

const FIXED_STYLES = asStyleDict({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  subtract: {
    flex: '0 0 auto',
  },
  add: {
    flex: '0 0 auto',
  },
  text: {
    flex: '1 1 auto',
  },
})

if (process.env.NODE_ENV !== 'production') {
  Counter.displayName = 'Counter'
  CounterTextField.displayName = 'CounterTextField'
  CounterAddButton.displayName = 'CounterAddButton'
  CounterSubtractButton.displayName = 'CounterSubtractButton'
}
