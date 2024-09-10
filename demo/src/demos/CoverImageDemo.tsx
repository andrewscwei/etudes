import { CoverImage, CoverImageContent, CoverImageViewport } from 'etudes/components/CoverImage'
import $$GitHubIcon from '../assets/svgs/github-icon.svg'
import { Frame } from '../components/Frame.js'

export function CoverImageDemo() {
  return (
    <Frame title='CoverImage' usesMaxHeight={true}>
      <CoverImage className='relative size-full' src={$$GitHubIcon}>
        <CoverImageViewport className='z-10 flex items-center justify-center'>
          <div className='flex items-center justify-center bg-black px-2 py-1 text-sm text-white'>Cover</div>
        </CoverImageViewport>
        <CoverImageContent className='pointer-events-none relative size-full bg-black/40'/>
      </CoverImage>
    </Frame>
  )
}
