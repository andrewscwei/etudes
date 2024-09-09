import { OptionButton } from 'etudes/components/OptionButton'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function OptionButtonDemo() {
  const [index, setIndex] = useState(0)

  return (
    <Frame title='OptionButton'>
      {(_, setFeedback) => (
        <OptionButton
          className='ia text-md flex items-center justify-center border border-black px-4 py-1'
          index={index}
          options={['Option 1', 'Option 2', 'Option 3']}
          onChange={(val, i) => {
            setIndex(i)
            setFeedback(`Changed to Option ${i + 1}`)
          }}
        />
      )}
    </Frame>
  )
}
