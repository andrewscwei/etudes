import { Panorama } from 'etudes/components/Panorama'
import { useState } from 'react'
import $$PanoramaImage from '../assets/images/panorama.png'
import { Frame } from '../components/Frame.js'

export function PanoramaDemo() {
  const [angle, setAngle] = useState(0)

  return (
    <Frame
      title='Panorama'
      usesMaxHeight={true}
    >
      <Panorama
        angle={angle}
        className='relative size-full'
        src={$$PanoramaImage}
        onAngleChange={setAngle}
      />
    </Frame>
  )
}
