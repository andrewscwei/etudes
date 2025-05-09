import clsx from 'clsx'
import { Slider, SliderKnob, SliderKnobContainer, SliderLabel, SliderTrack } from 'etudes'
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
        ['onlyDispatchesOnDragEnd: true', 'onlyDispatchesOnDragEnd: false'],
        ['orientation: horizontal', 'orientation: vertical'],
      ]}
      title='Slider'
      usesMaxHeight={true}
      onReset={() => setPosition(0)}
    >
      {({ isClipped, isInverted, isTrackInteractive, onlyDispatchesOnDragEnd, orientation }, toast) => (
        <Slider
          className={clsx('relative', {
            'h-1 w-44': orientation === 'horizontal',
            'h-32 w-1': orientation === 'vertical',
          })}
          isClipped={isClipped === 'true'}
          isInverted={isInverted === 'true'}
          isTrackInteractive={isTrackInteractive === 'true'}
          knobHeight={28}
          knobWidth={40}
          labelProvider={pos => `${Math.round(pos * (max - min) + min)}`}
          onlyDispatchesOnDragEnd={onlyDispatchesOnDragEnd === 'true'}
          orientation={orientation as any}
          position={position}
          trackPadding={0}
          onChange={pos => {
            setPosition(pos)
            toast(`Position: ${Math.round(pos * (max - min) + min)}`)
          }}
        >
          <SliderKnob className='ia flex items-center justify-center border border-dark bg-dark'/>
          <SliderKnobContainer
            className={clsx({
              '[:not(.dragging)]:transition-[left]': orientation === 'horizontal',
              '[:not(.dragging)]:transition-[top]': orientation === 'vertical',
            })}
          />
          <SliderLabel className='text-base text-light'/>
          <SliderTrack className='ia bg-dark/40 [.start]:bg-dark'/>
        </Slider>
      )}
    </Frame>
  )
}
