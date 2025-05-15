import clsx from 'clsx'
import { Toggle, ToggleKnob, ToggleTrack } from 'etudes'
import { useEffect, useState } from 'react'
import { Frame } from '../components/Frame.js'

export function ToggleDemo() {
  const [isOn, setIsOn] = useState(false)

  return (
    <Frame
      options={[
        ['isInverted: false', 'isInverted: true'],
        ['orientation: horizontal', 'orientation: vertical'],
      ]}
      title='Toggle'
      onReset={() => setIsOn(false)}
    >
      {({ isInverted, orientation }, toast) => {
        useEffect(() => {
          toast(isOn ? 'On' : 'Off')
        }, [isOn])

        return (
          <Toggle
            className={clsx('group', {
              'w-12 h-7': orientation === 'horizontal',
              'w-7 h-12': orientation === 'vertical',
            })}
            isInverted={isInverted === 'true'}
            isOn={isOn}
            orientation={orientation as 'horizontal' | 'vertical'}
            onChange={setIsOn}
          >
            <ToggleTrack className='size-full cursor-pointer rounded-full bg-dark p-1'/>
            <ToggleKnob
              className={clsx('aspect-square rounded-full bg-white/60 transition-all group-hover:opacity-80 [.on]:bg-white', {
                'h-full': orientation === 'horizontal',
                'w-full': orientation === 'vertical',
              })}
            />
          </Toggle>
        )
      }}
    </Frame>
  )
}
