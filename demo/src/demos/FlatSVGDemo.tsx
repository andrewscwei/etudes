import { FlatSVG } from 'etudes/components/FlatSVG'
import $$GitHubIcon from '../assets/svgs/github-icon.svg?raw'
import { Frame } from '../components/Frame.js'

export function FlatSVGDemo() {
  return (
    <Frame
      options={[
        ['shouldStripClasses: true', 'shouldStripClasses: false'],
        ['shouldStripExtraneousAttributes: true', 'shouldStripExtraneousAttributes: false'],
        ['shouldStripIds: true', 'shouldStripIds: false'],
        ['shouldStripStyles: true', 'shouldStripStyles: false'],
      ]}
      title='FlatSVG'
    >
      {({ shouldStripClasses, shouldStripExtraneousAttributes, shouldStripIds, shouldStripStyles }, toast) => (
        <FlatSVG
          className='svg:fill-black size-10'
          shouldStripClasses={shouldStripClasses === 'true'}
          shouldStripExtraneousAttributes={shouldStripExtraneousAttributes === 'true'}
          shouldStripIds={shouldStripIds === 'true'}
          shouldStripStyles={shouldStripStyles === 'true'}
          svg={$$GitHubIcon}
        />
      )}
    </Frame>
  )
}
