import { SelectableButton } from 'etudes/components/SelectableButton'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function SelectableButtonDemo() {
  const [isSelected, setIsSelected] = useState(false)

  return (
    <Frame
      options={[
        ['isDeselectable: true', 'isDeselectable: false'],
        ['isDisable: false', 'isDisabled: true'],
      ]}
      title='SelectableButton'
      onReset={() => setIsSelected(false)}
    >
      {({ isDeselectable, isDisabled }, toast) => (
        <SelectableButton
          className='ia flex items-center justify-center border border-black px-4 py-1 text-base active:bg-black active:text-white disabled:pointer-events-none'
          isDeselectable={isDeselectable === 'true'}
          isDisabled={isDisabled === 'true'}
          isSelected={isSelected}
          label='Button'
          onToggle={t => {
            setIsSelected(!t)
            toast(t ? 'Inactive' : 'Active')
          }}
        />
      )}
    </Frame>
  )
}