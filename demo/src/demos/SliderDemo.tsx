import clsx from 'clsx'
import { Slider } from 'etudes'
import { useState } from 'react'

import { Frame } from '../components/Frame.js'

export function SliderDemo() {
  const min = 0
  const max = 100
  const [position, setPosition] = useState(0)

  return (
    <Frame
      options={[
        ['isClipped: false', 'isClipped: true'],
        ['isInverted: false', 'isInverted: true'],
        ['isTrackInteractive: true', 'isTrackInteractive: false'],
        ['orientation: horizontal', 'orientation: vertical'],
      ]}
      title='Slider'
      usesMaxHeight={true}
      onReset={() => setPosition(0)}
    >
      {({ orientation, isClipped, isInverted, isTrackInteractive }, toast) => (
        <Slider
          className={clsx('relative', {
            'h-1 w-44': orientation === 'horizontal',
            'h-32 w-1': orientation === 'vertical',
          })}
          knobHeight={28}
          knobWidth={40}
          orientation={orientation as any}
          position={position}
          trackPadding={0}
          isClipped={isClipped === 'true'}
          isInverted={isInverted === 'true'}
          isTrackInteractive={isTrackInteractive === 'true'}
          formatLabel={pos => `${Math.round(pos * (max - min) + min)}`}
          onChange={(pos, isDragging) => {
            setPosition(pos)

            if (!isDragging) {
              toast(`Position: ${Math.round(pos * (max - min) + min)}`)
            }
          }}
        >
          <Slider.Knob className='ia flex items-center justify-center border border-dark bg-dark'/>
          <Slider.KnobContainer
            className={clsx({
              'transition-[left]': orientation === 'horizontal',
              'transition-[top]': orientation === 'vertical',
            })}
          />
          <Slider.Label className='text-base text-light'/>
          <Slider.Track className='ia bg-dark/40 data-[side=start]:bg-dark'/>
        </Slider>
      )}
    </Frame>
  )
}
