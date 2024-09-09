import { CycleButton } from 'etudes/components/CycleButton'
import { useState } from 'react'
import { Frame } from '../components/Frame'

export function CycleButtonDemo() {
  const [index, setIndex] = useState(0)

  return (
    <Frame title='components/CycleButton'>
      {(_, setFeedback) => (
        <CycleButton
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
