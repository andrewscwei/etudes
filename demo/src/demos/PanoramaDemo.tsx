import { Panorama } from 'etudes'
import { useState } from 'react'
import $$PanoramaImage from '../assets/panorama.png'
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
