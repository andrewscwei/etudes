import clsx from 'clsx'
import { StepSlider } from 'etudes'
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
        ['orientation: horizontal', 'orientation: vertical'],
      ]}
      title='StepSlider'
      usesMaxHeight={true}
      onReset={() => setIndex(0)}
    >
      {({ orientation, isClipped, isInverted, isTrackInteractive }, toast) => (
        <StepSlider
          className={clsx('relative', {
            'h-1 w-44': orientation === 'horizontal',
            'h-32 w-1': orientation === 'vertical',
          })}
          index={index}
          knobHeight={28}
          knobWidth={40}
          orientation={orientation as any}
          trackPadding={0}
          isClipped={isClipped === 'true'}
          isInverted={isInverted === 'true'}
          isTrackInteractive={isTrackInteractive === 'true'}
          formatLabel={(_, idx) => `${idx}`}
          onIndexChange={(idx, isDragging) => {
            setIndex(idx)

            if (!isDragging) {
              toast(`Index: ${idx}`)
            }
          }}
        >
          <StepSlider.Knob className='ia flex items-center justify-center border border-dark bg-dark'/>
          <StepSlider.KnobContainer
            className={clsx({
              'transition-[left]': orientation === 'horizontal',
              'transition-[top]': orientation === 'vertical',
            })}
          />
          <StepSlider.Label className='text-base text-light'/>
          <StepSlider.Track className='ia bg-dark/40 data-[position=start]:bg-dark'/>
        </StepSlider>
      )}
    </Frame>
  )
}
