import { Video } from 'etudes/components/Video'
import $$Video from '../assets/media/video.mp4'
import { Frame } from '../components/Frame.js'

export function VideoDemo() {
  return (
    <Frame
      options={[
        ['autoLoop=true', 'autoLoop=false'],
        ['hasControls=false', 'hasControls=true'],
      ]}
      title='Video'
    >
      {([autoLoop, hasControls], setFeedback) => (
        <Video
          autoLoop={autoLoop === 'autoLoop=true'}
          autoPlay={true}
          className='grayscale'
          hasControls={hasControls === 'hasControls=true'}
          src={$$Video}
          onEnd={() => setFeedback('Stopped')}
          onPause={() => setFeedback('Paused')}
          onPlay={() => setFeedback('Playing')}
        />
      )}
    </Frame>
  )
}
