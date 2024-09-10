import clsx from 'clsx'
import { StepwiseSlider, StepwiseSliderKnob, StepwiseSliderLabel, StepwiseSliderTrack } from 'etudes/components/StepwiseSlider'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function StepwiseSliderDemo() {
  const [index, setIndex] = useState(0)

  return (
    <Frame
      options={[
        ['isInverted: false', 'isInverted: true'],
        ['isTrackInteractive: true', 'isTrackInteractive: false'],
        ['onlyDispatchesOnDragEnd: true', 'onlyDispatchesOnDragEnd: false'],
        ['orientation: horizontal', 'orientation: vertical'],
      ]}
      title='StepwiseSlider'
      usesMaxHeight={true}
      onReset={() => setIndex(0)}
    >
      {({ isInverted, isTrackInteractive, onlyDispatchesOnDragEnd, orientation }, toast) => (
        <StepwiseSlider
          className={clsx('relative', {
            'h-1 w-44': orientation === 'horizontal',
            'h-32 w-1': orientation === 'vertical',
          })}
          index={index}
          isInverted={isInverted === 'true'}
          isTrackInteractive={isTrackInteractive === 'true'}
          knobHeight={28}
          knobWidth={40}
          labelProvider={(pos, idx) => `${idx}`}
          onlyDispatchesOnDragEnd={onlyDispatchesOnDragEnd === 'true'}
          orientation={orientation as any}
          trackPadding={0}
          onIndexChange={idx => {
            setIndex(idx)
            toast(`Index: ${idx}`)
          }}
        >
          <StepwiseSliderKnob className='bg-bg ia flex items-center justify-center border border-black'/>
          <StepwiseSliderLabel className='text-base text-black'/>
          <StepwiseSliderTrack className='ia bg-black/40'/>
        </StepwiseSlider>
      )}
    </Frame>
  )
}
