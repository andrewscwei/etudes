import clsx from 'clsx'
import { RangeSlider } from 'etudes'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function RangeSliderDemo() {
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(100)

  return (
    <Frame
      options={[
        ['isClipped: false', 'isClipped: true'],
        ['orientation: horizontal', 'orientation: vertical'],
      ]}
      title='RangeSlider'
      usesMaxHeight={true}
      onReset={() => {
        setMin(0)
        setMax(100)
      }}
    >
      {({ isClipped, orientation }, toast) => (
        <RangeSlider
          className={clsx('relative', {
            'h-1 w-44': orientation === 'horizontal',
            'h-32 w-1': orientation === 'vertical',
          })}
          decimalPlaces={0}
          isClipped={isClipped === 'true'}
          knobHeight={28}
          knobWidth={40}
          max={100}
          min={0}
          orientation={orientation as any}
          range={[min, max]}
          steps={99}
          onChange={range => {
            setMin(range[0])
            setMax(range[1])
            toast(`Min: ${Math.round(range[0])}, Max: ${Math.round(range[1])}`)
          }}
        >
          <RangeSlider.Gutter className='bg-dark/40'/>
          <RangeSlider.Highlight className='bg-dark'/>
          <RangeSlider.Knob className='ia flex items-center justify-center border border-dark bg-dark'/>
          <RangeSlider.KnobContainer
            className={clsx({
              '[.releasing]:transition-[left]': orientation === 'horizontal',
              '[.releasing]:transition-[top]': orientation === 'vertical',
            })}
          />
          <RangeSlider.Label className='text-base text-light'/>
        </RangeSlider>
      )}
    </Frame>
  )
}
