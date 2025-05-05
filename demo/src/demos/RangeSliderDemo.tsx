import clsx from 'clsx'
import { RangeSlider, RangeSliderGutter, RangeSliderHighlight, RangeSliderKnob, RangeSliderLabel } from 'etudes'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function RangeSliderDemo() {
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(100)

  return (
    <Frame
      options={[
        ['orientation: horizontal', 'orientation: vertical'],
      ]}
      title='RangeSlider'
      usesMaxHeight={true}
      onReset={() => {
        setMin(0)
        setMax(100)
      }}
    >
      {({ orientation }, toast) => (
        <RangeSlider
          className={clsx('relative', {
            'h-1 w-44': orientation === 'horizontal',
            'h-32 w-1': orientation === 'vertical',
          })}
          decimalPlaces={0}
          knobHeight={28}
          knobWidth={40}
          max={100}
          min={0}
          orientation={orientation as any}
          range={[min, max]}
          steps={99}
          onRangeChange={range => {
            setMin(range[0])
            setMax(range[1])
            toast(`Min: ${Math.round(range[0])}, Max: ${Math.round(range[1])}`)
          }}
        >
          <RangeSliderGutter className='bg-dark/40'/>
          <RangeSliderHighlight className='bg-dark'/>
          <RangeSliderKnob className='ia flex items-center justify-center border border-dark bg-dark'/>
          <RangeSliderLabel className='text-base text-light'/>
        </RangeSlider>
      )}
    </Frame>
  )
}
