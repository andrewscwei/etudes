import { Counter, CounterAddButton, CounterSubtractButton, CounterTextField } from 'etudes/components/Counter'
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
          className='relative gap-1 text-base text-black'
          max={Number(max)}
          min={Number(min)}
          quantity={quantity}
          onChange={t => {
            setQuantity(t)
            toast(`Quantity: ${t}`)
          }}
        >
          <CounterTextField className='border/black h-9 w-48 border bg-transparent px-2 outline-none'/>
          <CounterSubtractButton className='ia size-9 border border-black bg-transparent p-2'>-</CounterSubtractButton>
          <CounterAddButton className='ia size-9 border border-black bg-transparent p-2'>+</CounterAddButton>
        </Counter>
      )}
    </Frame>
  )
}
