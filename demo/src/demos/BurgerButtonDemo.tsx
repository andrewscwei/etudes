import { BurgerButton } from 'etudes'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function BurgerButtonDemo() {
  const [isNavActive, setIsNavActive] = useState(false)

  return (
    <Frame
      options={[
        ['isSplit: false', 'isSplit: true'],
        ['isTailHidden: false', 'isTailHidden: true'],
        ['numberOfBars: 3', 'numberOfBars: 2'],
      ]}
      title='BurgerButton'
      onReset={() => setIsNavActive(false)}
    >
      {({ isSplit, isTailHidden, numberOfBars }, toast) => (
        <BurgerButton
          className='ia relative size-4'
          isActive={isNavActive}
          isSplit={isSplit === 'true'}
          isTailHidden={isTailHidden === 'true'}
          numberOfBars={numberOfBars === '2' ? 2 : 3}
          onToggle={t => {
            setIsNavActive(t)
            toast(t ? 'Active' : 'Inactive')
          }}
        >
          <BurgerButton.Bar className='bg-dark h-0.5 transition-[left,top,right,bottom,transform]'/>
        </BurgerButton>
      )}
    </Frame>
  )
}
