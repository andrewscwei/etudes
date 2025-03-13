import { Video } from 'etudes'
import $$Video from '../assets/video.mov'
import { Frame } from '../components/Frame.js'

export function VideoDemo() {
  return (
    <Frame
      options={[
        ['autoLoop: true', 'autoLoop: false'],
        ['hasControls: false', 'hasControls: true'],
      ]}
      title='Video'
    >
      {({ autoLoop, hasControls }, toast) => (
        <Video
          autoLoop={autoLoop === 'true'}
          autoPlay={true}
          className='grayscale'
          hasControls={hasControls === 'true'}
          src={$$Video}
          onEnd={() => toast('Stopped')}
          onPause={() => toast('Paused')}
          onPlay={() => toast('Playing')}
        />
      )}
    </Frame>
  )
}
