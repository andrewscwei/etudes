import clsx from 'clsx'
import { Carousel, Conditional, Each } from 'etudes'
import { useState } from 'react'

import { Frame } from '../components/Frame.js'

function Item({ className, exposure, label, ...props }: { className?: string; exposure?: number; label: string }) {
  return (
    <div {...props} className={clsx(className, 'relative flex items-center justify-center border border-dark text-base')}>
      <span>{label}</span>
      <Conditional if={exposure}>
        <span className='absolute top-1/2 left-1/2 mt-5 -translate-1/2'>{`(exposure: ${exposure})`}</span>
      </Conditional>
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
      {({ autoAdvanceInterval, orientation, tracksItemExposure, isDragEnabled }, toast) => (
        <div className='flex size-full flex-col items-center justify-center gap-1'>
          <div className='flex w-full justify-stretch gap-1'>
            <Each
              in={items}
              render={(_, idx) => (
                <button
                  className='ia diabled:pointer-events-none flex h-6 grow items-center justify-center border border-dark px-2 text-xs disabled:bg-dark disabled:text-light'
                  disabled={index === idx}
                  onClick={() => setIndex(idx)}
                >
                  {idx + 1}
                </button>
              )}
            />
          </div>
          <Carousel
            className='w-full grow'
            autoAdvanceInterval={Number(autoAdvanceInterval)}
            index={index}
            ItemComponent={Item}
            items={items}
            orientation={orientation as any}
            tracksItemExposure={tracksItemExposure === 'true'}
            isDragEnabled={isDragEnabled === 'true'}
            onIndexChange={t => {
              setIndex(t)
              toast(`Slide ${t + 1}`)
            }}
          />
        </div>
      )}
    </Frame>
  )
}
