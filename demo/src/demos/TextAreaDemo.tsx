import { TextArea } from 'etudes'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function TextAreaDemo() {
  const [value, setValue] = useState('')

  return (
    <Frame title='TextArea' onReset={() => setValue('')}>
      <TextArea
        className='h-40 w-full resize-none border-1 border-dark bg-transparent p-2 text-base outline-none placeholder:text-dark'
        placeholder='Type here...'
        value={value}
        onChange={setValue}
      />
    </Frame>
  )
}
