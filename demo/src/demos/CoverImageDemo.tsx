import { CoverImage, CoverImageContent, CoverImageViewport } from 'etudes/components/CoverImage'
import $$Image from '../assets/image.png'
import { Frame } from '../components/Frame.js'

export function CoverImageDemo() {
  return (
    <Frame title='CoverImage' usesMaxHeight={true}>
      <CoverImage
        className='relative size-full'
        src={$$Image}
      >
        <CoverImageViewport className='z-10 flex items-center justify-center'>
          <div className='text-light bg-dark flex items-center justify-center px-2 py-1 text-sm'>Cover</div>
        </CoverImageViewport>
        <CoverImageContent className='bg-dark/40 pointer-events-none relative size-full'/>
      </CoverImage>
    </Frame>
  )
}
