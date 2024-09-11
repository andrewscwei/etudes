import { TextField } from 'etudes/components/TextField'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function TextFieldDemo() {
  const [value, setValue] = useState('')

  return (
    <Frame title='TextField' onReset={() => setValue('')}>
      <TextField
        className='border-dark placeholder:text-dark w-52 border bg-transparent p-2 text-base outline-none'
        placeholder='Type here...'
        value={value}
        onValueChange={setValue}
      />
    </Frame>
  )
}
