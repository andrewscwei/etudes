import clsx from 'clsx'
import { Carousel } from 'etudes/components/Carousel'
import { useState, type HTMLAttributes } from 'react'
import { Frame } from '../components/Frame.js'

function Item({ className, label, exposure, ...props }: HTMLAttributes<HTMLDivElement> & { exposure?: number; label: string }) {
  return (
    <div {...props} className={clsx(className, 'border-dark flex flex-col items-center justify-center border text-base')}>
      <span>{label}</span>
      {exposure !== undefined && (<span>{`(exposure: ${exposure})`}</span>)}
    </div>
  )
}

export function CarouselDemo() {
  const [index, setIndex] = useState(0)

  const items = [{
    label: 'Slide 1',
  }, {
    label: 'Slide 2',
  }, {
    label: 'Slide 3',
  }, {
    label: 'Slide 4',
  }, {
    label: 'Slide 5',
  }]

  return (
    <Frame
      options={[
        ['autoAdvanceInterval: -1', 'autoAdvanceInterval: 2000'],
        ['isDragEnabled: true', 'isDragEnabled: false'],
        ['orientation: horizontal', 'orientation: vertical'],
        ['tracksItemExposure: false', 'tracksItemExposure: true'],
      ]}
      title='Carousel'
      usesMaxHeight={true}
      onReset={() => setIndex(0)}
    >
      {({ autoAdvanceInterval, isDragEnabled, orientation, tracksItemExposure }, toast) => (
        <Carousel
          autoAdvanceInterval={Number(autoAdvanceInterval)}
          className='size-full'
          index={index}
          isDragEnabled={isDragEnabled === 'true'}
          ItemComponent={Item}
          items={items}
          orientation={orientation as any}
          tracksItemExposure={tracksItemExposure === 'true'}
          onIndexChange={t => {
            setIndex(t)
            toast(`Slide ${t + 1}`)
          }}
        />
      )}
    </Frame>
  )
}
