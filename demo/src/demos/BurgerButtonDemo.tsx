import { BurgerButton, BurgerButtonBar } from 'etudes/components/BurgerButton'
import { useState } from 'react'
import { Frame } from '../components/Frame'

export function BurgerButtonDemo() {
  const [isNavActive, setIsNavActive] = useState(false)

  return (
    <Frame
      options={[
        ['isSplit=false', 'isSplit=true'],
        ['isTailHidden=false', 'isTailHidden=true'],
      ]}
      title='components/BurgerButton'
    >
      {(selectedOptions, setFeedback) => (
        <BurgerButton
          className='ia relative size-4'
          isActive={isNavActive}
          isSplit={selectedOptions[0] === 'isSplit=true'}
          isTailHidden={selectedOptions[1] === 'isTailHidden=true'}
          onToggle={t => {
            setFeedback(t ? 'Inactive' : 'Active')
            setIsNavActive(!t)
          }}
        >
          <BurgerButtonBar className='h-[2px] bg-black transition-[left,top,right,bottom,transform]'/>
        </BurgerButton>
      )}
    </Frame>
  )
}
