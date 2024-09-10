import { WithTooltip } from 'etudes/components/WithTooltip'
import { Frame } from '../components/Frame.js'

export function WithTooltipDemo() {
  return (
    <Frame title='WithTooltip'>
      <WithTooltip hint='Hello, world!'>
        <span className='relative cursor-pointer border border-black px-2 py-1 text-base'>Hover me</span>
      </WithTooltip>
    </Frame>
  )
}
