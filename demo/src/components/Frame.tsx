import clsx from 'clsx'
import { OptionButton } from 'etudes/components/OptionButton'
import { Conditional } from 'etudes/operators/Conditional'
import { Repeat } from 'etudes/operators/Repeat'
import { useState, type ReactNode } from 'react'
import { Button } from '../../../lib/components/Button.js'

type Props = {
  children: ReactNode | ((selectedOptions: string[], setFeedback: (feedback: string) => void) => ReactNode)
  alignment?: 'start' | 'center' | 'end'
  options?: string[][]
  title: string
  useMaxHeight?: boolean
  onReset?: () => void
}

export function Frame({
  children,
  alignment = 'center',
  options = [],
  title,
  useMaxHeight = false,
  onReset,
}: Props) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(options.map(o => o[0]))
  const [feedback, setFeedback] = useState('')

  return (
    <div
      className={clsx('flex min-h-40 flex-col', {
        'h-80': useMaxHeight,
        'max-h-80': !useMaxHeight,
      })}
    >
      <div className='text-bg flex w-full justify-between overflow-hidden rounded-t-md bg-black px-3 py-1'>
        <h2 className='text-sm'>{title}</h2>
        <Conditional if={options.length > 0 || !!onReset}>
          <Button
            className='ia text-sm'
            onClick={() => {
              setSelectedOptions(options.map(o => o[0]))
              onReset?.()
            }}
          >
            Reset
          </Button>
        </Conditional>
      </div>
      <div className='gb relative flex flex-1 flex-col overflow-hidden rounded-b-md border border-t-0 border-black/40'>
        <Conditional if={options.length > 0}>
          <div className='flex flex-wrap items-center justify-start gap-1 p-2'>
            <Repeat count={options.length}>
              {i => (
                <OptionButton
                  className='ia flex h-6 items-center justify-center rounded-md border border-black/40 px-2 text-xs'
                  index={options[i].indexOf(selectedOptions[i])}
                  options={options[i]}
                  onChange={val => setSelectedOptions(prev => [...prev.slice(0, i), val, ...prev.slice(i + 1)])}
                />
              )}
            </Repeat>
          </div>
        </Conditional>
        <div
          className={clsx('os flex flex-1 items-center overflow-scroll p-3', {
            'justify-start': alignment === 'start',
            'justify-center': alignment === 'center',
            'justify-end': alignment === 'end',
          })}
        >
          {typeof children === 'function' ? children(selectedOptions, setFeedback) : children}
        </div>
        <div className='absolute bottom-0 h-6 w-full'>
          <Conditional if={!!feedback}>
            <div
              key={feedback}
              className='animate-fade bg-bg/20 vb flex h-full items-center justify-center truncate border-t border-black/40 px-3 text-center text-sm'
            >
              {feedback.replace(/^<[0-9]+>/, '')}
            </div>
          </Conditional>
        </div>
      </div>
    </div>
  )
}
