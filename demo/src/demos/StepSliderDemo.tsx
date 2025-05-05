import clsx from 'clsx'
import { StepSlider, StepSliderKnob, StepSliderLabel, StepSliderTrack } from 'etudes'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function StepSliderDemo() {
  const [index, setIndex] = useState(0)

  return (
    <Frame
      options={[
        ['isClipped: false', 'isClipped: true'],
        ['isInverted: false', 'isInverted: true'],
        ['isTrackInteractive: true', 'isTrackInteractive: false'],
        ['onlyDispatchesOnDragEnd: true', 'onlyDispatchesOnDragEnd: false'],
        ['orientation: horizontal', 'orientation: vertical'],
      ]}
      title='StepSlider'
      usesMaxHeight={true}
      onReset={() => setIndex(0)}
    >
      {({ isClipped, isInverted, isTrackInteractive, onlyDispatchesOnDragEnd, orientation }, toast) => (
        <StepSlider
          className={clsx('relative', {
            'h-1 w-44': orientation === 'horizontal',
            'h-32 w-1': orientation === 'vertical',
          })}
          index={index}
          isClipped={isClipped === 'true'}
          isInverted={isInverted === 'true'}
          isTrackInteractive={isTrackInteractive === 'true'}
          knobHeight={28}
          knobWidth={40}
          labelProvider={(_, idx) => `${idx}`}
          onlyDispatchesOnDragEnd={onlyDispatchesOnDragEnd === 'true'}
          orientation={orientation as any}
          trackPadding={0}
          onIndexChange={idx => {
            setIndex(idx)
            toast(`Index: ${idx}`)
          }}
        >
          <StepSliderKnob className='ia flex items-center justify-center border border-dark bg-dark'/>
          <StepSliderLabel className='text-base text-light'/>
          <StepSliderTrack className='ia bg-dark/40 [.start]:bg-dark'/>
        </StepSlider>
      )}
    </Frame>
  )
}
