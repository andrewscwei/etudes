import { CoverImage } from 'etudes'
import $$Image from '../assets/image.png'
import { Frame } from '../components/Frame.js'

export function CoverImageDemo() {
  return (
    <Frame title='CoverImage' usesMaxHeight={true}>
      <CoverImage
        className='relative size-full'
        src={$$Image}
      >
        <CoverImage.Viewport className='z-10 flex items-center justify-center'>
          <div className='text-light bg-dark flex items-center justify-center px-2 py-1 text-sm'>Cover</div>
        </CoverImage.Viewport>
        <CoverImage.Content className='bg-dark/40 pointer-events-none relative size-full'/>
      </CoverImage>
    </Frame>
  )
}
