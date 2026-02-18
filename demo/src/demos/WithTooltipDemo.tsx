import { WithTooltip } from 'etudes'

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
          className='text-light bg-dark z-50 px-2 py-1 text-sm'
          alignment={alignment as any}
          hint='Hello, world!'
        >
          <span className='border-dark relative cursor-pointer border px-2 py-1 text-base'>Hover me</span>
        </WithTooltip>
      )}
    </Frame>
  )
}
