import { Button } from 'etudes'

import { Frame } from '../components/Frame.js'

export function ButtonDemo() {
  return (
    <Frame title='Button'>
      {(_, toast) => (
        <Button
          className='ia border-dark flex items-center justify-center border px-4 py-1 text-base'
          action={() => toast(`<${Date.now()}>Click`)}
          label='Button'
        />
      )}
    </Frame>
  )
}
