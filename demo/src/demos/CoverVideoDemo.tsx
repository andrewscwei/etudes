import { CoverVideo, CoverVideoContent, CoverVideoViewport } from 'etudes/components/CoverVideo'
import $$Video from '../assets/video.mov'
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
            <div className='text-light bg-dark flex items-center justify-center px-2 py-1 text-sm'>Cover</div>
          </CoverVideoViewport>
          <CoverVideoContent className='bg-dark/40 pointer-events-none relative size-full'/>
        </CoverVideo>
      )}
    </Frame>
  )
}
