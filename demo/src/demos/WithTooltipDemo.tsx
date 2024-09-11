import { WithTooltip } from 'etudes/components/WithTooltip'
import { Frame } from '../components/Frame.js'

export function WithTooltipDemo() {
  return (
    <Frame
      options={[
        ['alignment: tc', 'alignment: tl', 'alignment: tr', 'alignment: cl', 'alignment: cr', 'alignment: bc', 'alignment: bl', 'alignment: br'],
      ]}
      title='WithTooltip'
      usesMaxHeight={true}
    >
      {({ alignment }) => (
        <WithTooltip
          alignment={alignment as any}
          className='text-bg z-50 bg-black px-2 py-1 text-sm'
          hint='Hello, world!'
        >
          <span className='relative cursor-pointer border border-black px-2 py-1 text-base'>Hover me</span>
        </WithTooltip>
      )}
    </Frame>
  )
}
