import clsx from 'clsx'
import { type HTMLAttributes, type Ref, useEffect, useState } from 'react'

import { usePrevious } from '../hooks/usePrevious.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'
import { TextField as _TextField } from './TextField.js'

/**
 * A component that allows the user to increment or decrement a quantity using
 * buttons or by typing in a text field.
 *
 * @exports Counter.TextField Component for the text field.
 * @exports Counter.AddButton Component for the add button.
 * @exports Counter.SubtractButton Component for the subtract button.
 */
export function Counter({
  ref,
  style,
  allowsInput = true,
  children,
  max = NaN,
  min = NaN,
  quantity = 0,
  onChange,
  ...props
}: Counter.Props) {
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
    } else {
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
    addButton: Counter.AddButton,
    subscribeButton: Counter.SubtractButton,
    textField: Counter.TextField,
  })

  return (
    <div {...props} ref={ref} style={styles(style, FIXED_STYLES.root)}>
      <Styled
        className={clsx({ disabled: isSubtractingDisabled })}
        style={styles(FIXED_STYLES.subtract)}
        element={components.subscribeButton ?? <Counter.SubtractButton/>}
        onClick={() => handleSubtract()}
      />
      <Styled
        style={styles(FIXED_STYLES.textField)}
        element={components.textField ?? <Counter.TextField/>}
        value={text}
        isDisabled={!allowsInput}
        onChange={handleInputProgress}
        onUnfocus={handleInputComplete}
      />
      <Styled
        className={clsx({ disabled: isAddingDisabled })}
        style={styles(FIXED_STYLES.add)}
        element={components.addButton ?? <Counter.AddButton/>}
        onClick={() => handleAdd()}
      />
    </div>
  )
}

export namespace Counter {
  /**
   * Type describing the props of {@link Counter}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLDivElement>

    /**
     * The minimum quantity that can be set.
     */
    min?: number

    /**
     * The maximum quantity that can be set.
     */
    max?: number

    /**
     * The quantity.
     */
    quantity?: number

    /**
     * Specifies if the quantity can be modified via user text input.
     */
    allowsInput?: boolean

    /**
     * Handler invoked when the quantity changes.
     *
     * @param quantity The new quantity.
     */
    onChange?: (quantity: number) => void
  } & Omit<HTMLAttributes<HTMLElement>, 'onChange'>

  /**
   * Component for the text field in a {@link Counter}.
   */
  export const TextField = ({ ...props }: _TextField.Props) => (
    <_TextField {...props}/>
  )

  /**
   * Component for the add button in a {@link Counter}.
   */
  export const AddButton = ({ children, ...props }: HTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>
      {children}
    </button>
  )

  /**
   * Component for the subtract button in a {@link Counter}.
   */
  export const SubtractButton = ({ children, ...props }: HTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>
      {children}
    </button>
  )
}

const FIXED_STYLES = asStyleDict({
  add: {
    flex: '0 0 auto',
  },
  root: {
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'stretch',
  },
  subtract: {
    flex: '0 0 auto',
  },
  textField: {
    width: '100%',
  },
})

if (process.env.NODE_ENV === 'development') {
  Counter.displayName = 'Counter'
  Counter.AddButton.displayName = 'Counter.AddButton'
  Counter.SubtractButton.displayName = 'Counter.SubtractButton'
  Counter.TextField.displayName = 'Counter.TextField'
}
