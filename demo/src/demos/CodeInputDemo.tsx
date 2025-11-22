import clsx from 'clsx'
import { CodeInput } from 'etudes'
import { useEffect, useState } from 'react'
import { Frame } from '../components/Frame.js'

export function CodeInputDemo() {
  const [value, setValue] = useState<string[]>([])

  return (
    <Frame
      options={[
        ['size: 4', 'size: 6'],
      ]}
      title='CodeInput'
      onReset={() => setValue([])}
    >
      {({ size }, toast) => {
        useEffect(() => {
          toast(`Value: ${value.join('')}`)
        }, [value])

        return (
          <CodeInput
            className={clsx('h-16 gap-2 text-base caret-black', {
              'w-48': size === '4',
              'w-72': size === '6',
            })}
            placeholder='0'
            size={Number(size)}
            value={value}
            onChange={setValue}
          >
            <CodeInput.Field className='ia border border-dark text-center text-5xl transition-colors outline-none focus-within:bg-dark focus-within:text-light'/>
          </CodeInput>
        )
      }}
    </Frame>
  )
}
