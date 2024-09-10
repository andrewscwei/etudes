import { TextField } from 'etudes/components/TextField'
import { useState } from 'react'
import { Frame } from '../components/Frame.js'

export function TextFieldDemo() {
  const [value, setValue] = useState('')

  return (
    <Frame title='TextField' onReset={() => setValue('')}>
      <TextField
        className='w-52 border border-black bg-transparent p-2 text-base outline-none placeholder:text-black'
        placeholder='Type here...'
        value={value}
        onValueChange={setValue}
      />
    </Frame>
  )
}
