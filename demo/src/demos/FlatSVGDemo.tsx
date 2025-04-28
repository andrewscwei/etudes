import { FlatSVG } from 'etudes'
import $$GitHubIcon from '../assets/github-icon.svg?raw'
import { Frame } from '../components/Frame.js'

export function FlatSVGDemo() {
  return (
    <Frame
      options={[
        ['fillMode: preserve', 'fillMode: none', 'fillMode: fill', 'fillMode: width', 'fillMode: height'],
        ['shouldStripClasses: true', 'shouldStripClasses: false'],
        ['shouldStripIds: true', 'shouldStripIds: false'],
        ['shouldStripPositions: true', 'shouldStripPositions: false'],
        ['shouldStripStyles: true', 'shouldStripStyles: false'],
      ]}
      title='FlatSVG'
    >
      {({ fillMode, shouldStripClasses, shouldStripPositions, shouldStripIds, shouldStripStyles }, _) => (
        <FlatSVG
          className='svg:fill-dark size-10'
          fillMode={fillMode as any}
          shouldStripClasses={shouldStripClasses === 'true'}
          shouldStripIds={shouldStripIds === 'true'}
          shouldStripPositions={shouldStripPositions === 'true'}
          shouldStripStyles={shouldStripStyles === 'true'}
          svg={$$GitHubIcon}
        />
      )}
    </Frame>
  )
}
