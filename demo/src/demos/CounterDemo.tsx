import { Counter, CounterAddButton, CounterSubtractButton, CounterTextField } from 'etudes'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function CounterDemo() {
  const [quantity, setQuantity] = useState(0)

  return (
    <Frame
      options={[
        ['allowsInput: true', 'allowsInput: false'],
        ['min: 0', 'min: -10', 'min: NaN'],
        ['max: 10', 'max: 100', 'max: NaN'],
      ]}
      title='Counter'
      onReset={() => setQuantity(0)}
    >
      {({ allowsInput, min, max }, toast) => (
        <Counter
          allowsInput={allowsInput === 'true'}
          className='text-dark relative gap-1 text-base w-48'
          max={Number(max)}
          min={Number(min)}
          quantity={quantity}
          onChange={t => {
            setQuantity(t)
            toast(`Quantity: ${t}`)
          }}
        >
          <CounterTextField className='ia border/black border bg-transparent px-2 text-center outline-none'/>
          <CounterSubtractButton className='ia border-dark w-9 border bg-transparent p-2'>-</CounterSubtractButton>
          <CounterAddButton className='ia border-dark w-9 border bg-transparent p-2'>+</CounterAddButton>
        </Counter>
      )}
    </Frame>
  )
}
