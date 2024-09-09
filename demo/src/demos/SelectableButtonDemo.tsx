import { SelectableButton } from 'etudes/components/SelectableButton'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function SelectableButtonDemo() {
  const [isSelected, setIsSelected] = useState(false)

  return (
    <Frame
      options={[
        ['isDeselectable=true', 'isDeselectable=false'],
        ['isDisabled=false', 'isDisabled=true'],
      ]}
      title='SelectableButton'
      onReset={() => setIsSelected(false)}
    >
      {([isDeselectable, isDisabled], setFeedback) => (
        <SelectableButton
          className='ia text-md flex items-center justify-center border border-black px-4 py-1 active:bg-black active:text-white disabled:pointer-events-none'
          isDeselectable={isDeselectable === 'isDeselectable=true'}
          isDisabled={isDisabled === 'isDisabled=true'}
          isSelected={isSelected}
          label='Button'
          onToggle={t => {
            setIsSelected(!t)
            setFeedback(t ? 'Inactive' : 'Active')
          }}
        />
      )}
    </Frame>
  )
}
