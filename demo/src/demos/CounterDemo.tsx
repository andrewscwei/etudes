import { Counter, CounterAddButton, CounterSubtractButton, CounterTextField } from 'etudes'
import { useState } from 'react'
import $$MinusIcon from '../assets/minus-icon.svg?raw'
import $$PlusIcon from '../assets/plus-icon.svg?raw'
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
          className='relative h-9 w-48 gap-1 text-base text-dark'
          max={Number(max)}
          min={Number(min)}
          quantity={quantity}
          onChange={t => {
            setQuantity(t)
            toast(`Quantity: ${t}`)
          }}
        >
          <CounterTextField className='ia border/black border bg-transparent px-2 text-center outline-none'/>
          <CounterSubtractButton className='ia flex w-9 items-center border border-dark bg-transparent justify-center p-2' dangerouslySetInnerHTML={{ __html: $$MinusIcon }}/>
          <CounterAddButton className='ia flex w-9 items-center justify-center border border-dark bg-transparent p-2' dangerouslySetInnerHTML={{ __html: $$PlusIcon }}/>
        </Counter>
      )}
    </Frame>
  )
}
