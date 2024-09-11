import { CoverVideo, CoverVideoContent, CoverVideoViewport } from 'etudes/components/CoverVideo'
import $$Video from '../assets/media/video.mp4'
import { Frame } from '../components/Frame.js'

export function CoverVideoDemo() {
  return (
    <Frame title='CoverVideo' usesMaxHeight={true}>
      {(_, toast) => (
        <CoverVideo
          autoLoop={true}
          autoPlay={true}
          className='relative size-full grayscale'
          src={$$Video}
          onEnd={() => toast('Stopped')}
          onPause={() => toast('Paused')}
          onPlay={() => toast('Playing')}
        >
          <CoverVideoViewport className='z-10 flex items-center justify-center'>
            <div className='text-bg flex items-center justify-center bg-black px-2 py-1 text-sm'>Cover</div>
          </CoverVideoViewport>
          <CoverVideoContent className='pointer-events-none relative size-full bg-black/40'/>
        </CoverVideo>
      )}
    </Frame>
  )
}
