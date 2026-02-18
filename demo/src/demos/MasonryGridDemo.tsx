import clsx from 'clsx'
import { Each, MasonryGrid, type MasonryGridOrientation } from 'etudes'
import { type PropsWithChildren } from 'react'

import { Frame } from '../components/Frame.js'

const GridItem = ({ className, children, onClick }: PropsWithChildren<{ className?: string; onClick: () => void }>) => {
  return (
    <button className={clsx(className, 'ia border-dark flex items-center justify-center border text-base')} onClick={onClick}>
      {children}
    </button>
  )
}

export function MasonryGridDemo() {
  const items = [...new Array(100)].map(() => ({
    b: Math.floor(Math.random() * 1) + 1,
    h: Math.floor(Math.random() * 6) + 1,
  }))

  return (
    <Frame
      alignment='start'
      options={[
        ['alignSections: false', 'alignSections: true'],
        ['isReversed: false', 'isReversed: true'],
        ['orientation: vertical', 'orientation: horizontal'],
      ]}
      title='MasonryGrid'
      usesMaxHeight={true}
    >
      {({ alignSections, orientation, isReversed }, toast) => (
        <MasonryGrid
          className={clsx('relative self-start', {
            'h-full': orientation === 'horizontal',
            'w-full': orientation === 'vertical',
          })}
          alignSections={alignSections === 'true'}
          horizontalSpacing={12}
          orientation={orientation as MasonryGridOrientation}
          sections={4}
          verticalSpacing={12}
          isReversed={isReversed === 'true'}
        >
          <Each in={items}>
            {(val, idx) => (
              <GridItem
                className={clsx({
                  'base-1': val.b === 1,
                  'base-2': val.b === 2,
                  'base-3': val.b === 3,
                  'base-4': val.b === 4,
                  'base-5': val.b === 5,
                  'base-6': val.b === 6,
                  'h-12': orientation === 'vertical' ? val.h === 2 : undefined,
                  'h-16': orientation === 'vertical' ? val.h === 3 : undefined,
                  'h-24': orientation === 'vertical' ? val.h === 4 : undefined,
                  'h-28': orientation === 'vertical' ? val.h === 5 : undefined,
                  'h-32': orientation === 'vertical' ? val.h === 6 : undefined,
                  'h-8': orientation === 'vertical' ? val.h === 1 : undefined,
                  'w-12': orientation === 'horizontal' ? val.h === 2 : undefined,
                  'w-16': orientation === 'horizontal' ? val.h === 3 : undefined,
                  'w-24': orientation === 'horizontal' ? val.h === 4 : undefined,
                  'w-28': orientation === 'horizontal' ? val.h === 5 : undefined,
                  'w-32': orientation === 'horizontal' ? val.h === 6 : undefined,
                  'w-8': orientation === 'horizontal' ? val.h === 1 : undefined,
                })}
                onClick={() => toast(`<${Date.now()}>Clicked Item ${idx + 1}`)}
              >
                {idx + 1}
              </GridItem>
            )}
          </Each>
        </MasonryGrid>
      )}
    </Frame>
  )
}
