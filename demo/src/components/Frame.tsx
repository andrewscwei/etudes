import clsx from 'clsx'
import { Button, Conditional, OptionButton, Repeat } from 'etudes'
import { type ReactNode, useState } from 'react'

type Props = {
  alignment?: 'center' | 'end' | 'start'
  children: ((selectedOptions: Record<string, string>, toast: (feedback: string) => void) => ReactNode) | ReactNode
  options?: string[][]
  title: string
  usesMaxHeight?: boolean
  onReset?: () => void
}

function mapSelectedOptions(selectedOptions: string[]) {
  return selectedOptions.reduce((acc, cur) => {
    const [name, value] = cur.split(': ')

    return {
      ...acc,
      [name]: value,
    }
  }, {})
}

export function Frame({
  alignment = 'center',
  children,
  options = [],
  title,
  usesMaxHeight = false,
  onReset,
  ...props
}: Props) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(options.map(o => o[0]))
  const [feedback, toast] = useState('')

  return (
    <div
      {...props}
      className={clsx('flex min-h-40 flex-col', {
        'h-80': usesMaxHeight,
        'max-h-80': !usesMaxHeight,
      })}
    >
      <div className='text-light bg-dark flex w-full justify-between overflow-hidden rounded-t-md px-3 py-1'>
        <h2 className='text-sm'>{title}</h2>
        <Conditional if={options.length > 0 || !!onReset}>
          <Button
            className='ia text-sm'
            action={() => {
              setSelectedOptions(options.map(o => o[0]))
              onReset?.()
            }}
          >
            Reset
          </Button>
        </Conditional>
      </div>
      <div className='gb border-dark/40 relative flex flex-1 flex-col overflow-hidden rounded-b-md border border-t-0'>
        <Conditional if={options.length > 0}>
          <div className='flex flex-wrap items-center justify-start gap-1 p-2'>
            <Repeat count={options.length}>
              {i => (
                <OptionButton
                  className='ia border-dark/40 flex h-6 grow items-center justify-center rounded-md border px-2 text-xs'
                  index={options[i].indexOf(selectedOptions[i])}
                  options={options[i]}
                  onChange={t => setSelectedOptions(prev => [...prev.slice(0, i), t, ...prev.slice(i + 1)])}
                />
              )}
            </Repeat>
          </div>
        </Conditional>
        <div
          className={clsx('os flex flex-1 items-center overflow-scroll p-3', {
            'justify-center': alignment === 'center',
            'justify-end': alignment === 'end',
            'justify-start': alignment === 'start',
          })}
        >
          {typeof children === 'function' ? children(mapSelectedOptions(selectedOptions), toast) : children}
        </div>
        <div className='absolute bottom-0 h-6 w-full'>
          <Conditional if={!!feedback}>
            <div
              className='animate-fade bg-light/20 vb border-dark/40 flex h-full items-center justify-center truncate border-t px-3 text-center text-sm'
              key={feedback}
            >
              {feedback.replace(/^<[0-9]+>/, '')}
            </div>
          </Conditional>
        </div>
      </div>
    </div>
  )
}
