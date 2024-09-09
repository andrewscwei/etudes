import { SelectableButton } from 'etudes/components/SelectableButton'
import { useState } from 'react'
import { Frame } from '../components/Frame'

export function SelectableButtonDemo() {
  const [isSelected, setIsSelected] = useState(false)

  return (
    <Frame
      options={[
        ['isDisabled=false', 'isDisabled=true'],
        ['isDeselectable=true', 'isDeselectable=false'],
      ]}
      title='components/SelectableButton'
    >
      {(selectedOptions, setFeedback) => (
        <SelectableButton
          className='ia text-md flex items-center justify-center border border-black px-4 py-1 active:bg-black active:text-white disabled:pointer-events-none'
          isDeselectable={selectedOptions[1] === 'isDeselectable=true'}
          isDisabled={selectedOptions[0] === 'isDisabled=true'}
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
