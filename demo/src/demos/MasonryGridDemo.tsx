import clsx from 'clsx'
import { MasonryGrid } from 'etudes/components/MasonryGrid'
import { Each } from 'etudes/operators/Each'
import { type HTMLAttributes, type PropsWithChildren } from 'react'
import { Frame } from '../components/Frame.js'

export function MasonryGridDemo() {
  const items = [...new Array(100)].map((v, i) => ({
    h: Math.floor(Math.random() * 6) + 1,
    b: Math.floor(Math.random() * 1) + 1,
  }))

  return (
    <Frame
      alignment='start'
      options={[
        ['alignSections=false', 'alignSections=true'],
        ['isReversed=false', 'isReversed=true'],
        ['orientation=vertical', 'orientation=horizontal'],
      ]}
      title='MasonryGrid'
      useMaxHeight={true}
    >
      {([alignSections, isReversed, orientation], setFeedback) => (
        <MasonryGrid
          alignSections={alignSections === 'alignSections=true'}
          className={clsx('relative self-start', {
            'w-full': orientation === 'orientation=vertical',
            'h-full': orientation === 'orientation=horizontal',
          })}
          horizontalSpacing={12}
          isReversed={isReversed === 'isReversed=true'}
          orientation={orientation === 'orientation=vertical' ? 'vertical' : 'horizontal'}
          sections={4}
          verticalSpacing={12}
        >
          <Each in={items}>
            {(val, idx) => (
              <GridItem
                className={clsx({
                  'h-8': orientation === 'orientation=vertical' ? val.h === 1 : undefined,
                  'h-12': orientation === 'orientation=vertical' ? val.h === 2 : undefined,
                  'h-16': orientation === 'orientation=vertical' ? val.h === 3 : undefined,
                  'h-24': orientation === 'orientation=vertical' ? val.h === 4 : undefined,
                  'h-28': orientation === 'orientation=vertical' ? val.h === 5 : undefined,
                  'h-32': orientation === 'orientation=vertical' ? val.h === 6 : undefined,
                  'w-8': orientation === 'orientation=horizontal' ? val.h === 1 : undefined,
                  'w-12': orientation === 'orientation=horizontal' ? val.h === 2 : undefined,
                  'w-16': orientation === 'orientation=horizontal' ? val.h === 3 : undefined,
                  'w-24': orientation === 'orientation=horizontal' ? val.h === 4 : undefined,
                  'w-28': orientation === 'orientation=horizontal' ? val.h === 5 : undefined,
                  'w-32': orientation === 'orientation=horizontal' ? val.h === 6 : undefined,
                  'base-1': val.b === 1,
                  'base-2': val.b === 2,
                  'base-3': val.b === 3,
                  'base-4': val.b === 4,
                  'base-5': val.b === 5,
                  'base-6': val.b === 6,
                })}
                onClick={() => setFeedback(`<${Date.now()}>Clicked Item ${idx + 1}`)}
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

const GridItem = ({ children, className, ...props }: HTMLAttributes<HTMLButtonElement> & PropsWithChildren) => {
  return (
    <button {...props} className={clsx(className, 'ia flex items-center justify-center border border-black/40 text-sm')}>
      {children}
    </button>
  )
}
