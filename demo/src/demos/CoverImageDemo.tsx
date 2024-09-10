import { CoverImage } from 'etudes/components/CoverImage'
import $$GitHubIcon from '../assets/svgs/github-icon.svg'
import { Frame } from '../components/Frame.js'

export function CoverImageDemo() {
  return (
    <Frame title='CoverImage'>
      <CoverImage src={$$GitHubIcon}/>
    </Frame>
  )
}
