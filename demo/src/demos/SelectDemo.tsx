import { Select } from 'etudes'
import { useEffect, useState } from 'react'

import $$ExpandIcon from '../assets/expand-icon.svg?raw'
import { Frame } from '../components/Frame.js'

export function SelectDemo() {
  const options = ['Option 1', 'Option 2', 'Option 3']
  const [value, setValue] = useState('')

  return (
    <Frame title='Select' onReset={() => setValue('')}>
      {(_, toast) => {
        useEffect(() => {
          toast(`Selected option: ${value || 'none'}`)
        }, [value])

        return (
          <Select
            className='ia h-9 w-52 border border-dark text-base text-dark'
            options={options}
            placeholder='Select an option'
            value={value}
            onChange={setValue}
          >
            <Select.Toggle className='cursor-pointer px-3'/>
            <Select.ExpandIcon className='mr-3 flex size-5 items-center justify-center' dangerouslySetInnerHTML={{ __html: $$ExpandIcon }}/>
          </Select>
        )
      }}
    </Frame>
  )
}
