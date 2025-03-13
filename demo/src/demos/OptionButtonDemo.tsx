import { OptionButton } from 'etudes'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function OptionButtonDemo() {
  const [index, setIndex] = useState(0)

  return (
    <Frame title='OptionButton' onReset={() => setIndex(0)}>
      {(_, toast) => (
        <OptionButton
          className='ia border-dark flex items-center justify-center border px-4 py-1 text-base'
          index={index}
          options={['Option 1', 'Option 2', 'Option 3']}
          onChange={(val, i) => {
            setIndex(i)
            toast(`Changed to Option ${i + 1}`)
          }}
        />
      )}
    </Frame>
  )
}
