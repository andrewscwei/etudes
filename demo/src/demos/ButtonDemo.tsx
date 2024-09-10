import { Button } from 'etudes/components/Button'
import { Frame } from '../components/Frame.js'

export function ButtonDemo() {
  return (
    <Frame title='Button'>
      {(_, toast) => (
        <Button
          className='ia flex items-center justify-center border border-black px-4 py-1 text-base'
          label='Button'
          onClick={t => toast(`<${Date.now()}>Click`)}
        />
      )}
    </Frame>
  )
}
