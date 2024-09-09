import { Button } from 'etudes/components/Button'
import { Frame } from '../components/Frame'

export function ButtonDemo() {
  return (
    <Frame title='components/Button'>
      {(_, setFeedback) => (
        <Button
          className='ia text-md flex items-center justify-center border border-black px-4 py-1'
          label='Button'
          onClick={t => setFeedback(`<${Date.now()}>Click`)}
        />
      )}
    </Frame>
  )
}
