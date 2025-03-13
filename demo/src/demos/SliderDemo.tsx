import clsx from 'clsx'
import { Slider, SliderKnob, SliderLabel, SliderTrack } from 'etudes'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function SliderDemo() {
  const min = 0
  const max = 100
  const [position, setPosition] = useState(0)

  return (
    <Frame
      options={[
        ['isInverted: false', 'isInverted: true'],
        ['isTrackInteractive: true', 'isTrackInteractive: false'],
        ['onlyDispatchesOnDragEnd: true', 'onlyDispatchesOnDragEnd: false'],
        ['orientation: horizontal', 'orientation: vertical'],
      ]}
      title='Slider'
      usesMaxHeight={true}
      onReset={() => setPosition(0)}
    >
      {({ isInverted, isTrackInteractive, onlyDispatchesOnDragEnd, orientation }, toast) => (
        <Slider
          className={clsx('relative', {
            'h-1 w-44': orientation === 'horizontal',
            'h-32 w-1': orientation === 'vertical',
          })}
          isInverted={isInverted === 'true'}
          isTrackInteractive={isTrackInteractive === 'true'}
          knobHeight={28}
          knobWidth={40}
          labelProvider={pos => `${Math.round(pos * (max - min) + min)}`}
          onlyDispatchesOnDragEnd={onlyDispatchesOnDragEnd === 'true'}
          orientation={orientation as any}
          position={position}
          trackPadding={0}
          onPositionChange={pos => {
            setPosition(pos)
            toast(`Position: ${pos.toFixed(2)}`)
          }}
        >
          <SliderKnob className='bg-light ia border-dark flex items-center justify-center border'/>
          <SliderLabel className='text-dark text-base'/>
          <SliderTrack className='ia bg-dark/40'/>
        </Slider>
      )}
    </Frame>
  )
}
