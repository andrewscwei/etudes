import { Carousel, Conditional, Each, useCarouselItem } from 'etudes'
import { useState } from 'react'

import { Frame } from '../components/Frame.js'

function Item({ label }: { label: string }) {
  const { exposure } = useCarouselItem()

  return (
    <div className='relative flex size-full items-center justify-center border border-dark text-base'>
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
        ['orientation: horizontal', 'orientation: vertical'],
        ['shouldTrackExposure: false', 'shouldTrackExposure: true'],
      ]}
      title='Carousel'
      usesMaxHeight={true}
      onReset={() => setIndex(0)}
    >
      {({ autoAdvanceInterval, orientation, shouldTrackExposure }, toast) => (
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
            orientation={orientation as any}
            shouldTrackExposure={shouldTrackExposure === 'true'}
            onIndexChange={t => {
              setIndex(t)
              toast(`Slide ${t + 1}`)
            }}
          >
            <Carousel.Content>
              {items.map(item => (
                <Item
                  key={item.label}
                  label={item.label}
                />
              ))}
            </Carousel.Content>
          </Carousel>
        </div>
      )}
    </Frame>
  )
}
