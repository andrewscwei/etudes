import { TextField } from 'etudes'
import { useState } from 'react'

import { Frame } from '../components/Frame.js'

export function TextFieldDemo() {
  const [value, setValue] = useState('')

  return (
    <Frame title='TextField' onReset={() => setValue('')}>
      <TextField
        className='w-52 border border-dark bg-transparent p-2 text-base caret-black outline-none placeholder:text-dark'
        placeholder='Type here...'
        value={value}
        onChange={setValue}
      />
    </Frame>
  )
}
