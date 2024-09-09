import { OptionButton } from 'etudes/components/OptionButton'
import { Conditional } from 'etudes/operators/Conditional'
import { Repeat } from 'etudes/operators/Repeat'
import { useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode | ((selectedOptions: string[], setFeedback: (feedback: string) => void) => ReactNode)
  options?: string[][]
  title: string
}

export function Frame({
  children,
  options = [],
  title,
}: Props) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(options.map(o => o[0]))
  const [feedback, setFeedback] = useState('')

  return (
    <div className='relative flex flex-col'>
      <h2 className='text-bg w-full overflow-hidden rounded-t-md bg-black px-3 py-1 text-sm'>{title}</h2>
      <div className='gb flex flex-1 flex-col overflow-hidden rounded-b-md border border-t-0 border-black/40'>
        <Conditional if={options.length > 0}>
          <div className='flex flex-wrap items-center justify-start gap-1 p-2'>
            <Repeat count={options.length}>
              {i => (
                <OptionButton
                  className='ia flex h-6 items-center justify-center rounded-md border border-black/40 px-2 text-sm'
                  index={options[i].indexOf(selectedOptions[i])}
                  options={options[i]}
                  onChange={val => setSelectedOptions(prev => [...prev.slice(0, i), val, ...prev.slice(i + 1)])}
                />
              )}
            </Repeat>
          </div>
        </Conditional>
        <div className='flex min-h-32 flex-1 items-center justify-center px-3 py-7'>
          {typeof children === 'function' ? children(selectedOptions, setFeedback) : children}
        </div>
        <div className='h-6 w-full'>
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
