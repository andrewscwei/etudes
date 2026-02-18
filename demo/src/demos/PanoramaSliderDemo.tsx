import { PanoramaSlider } from 'etudes'
import { useState } from 'react'
import { Size } from 'spase'

import $$PanoramaImage from '../assets/panorama.png'
import { Frame } from '../components/Frame.js'

export function PanoramaSliderDemo() {
  const [angle, setAngle] = useState(0)
  const [zeroAnchor] = useState(0.5)

  return (
    <Frame
      title='PanoramaSlider'
    >
      <PanoramaSlider
        className='relative h-24'
        angle={angle}
        src={$$PanoramaImage}
        viewportSize={Size.make(500, 400)}
        zeroAnchor={zeroAnchor}
        onAngleChange={setAngle}
      >
        <PanoramaSlider.Indicator className='absolute inset-x-0 -bottom-2 mx-auto h-0.5 bg-light/40 [.dragging]:bg-light'/>
        <PanoramaSlider.Reticle className='h-full bg-dark/20 transition-colors [.dragging]:bg-dark/0'/>
        <PanoramaSlider.Track className='h-full bg-dark/40 transition-colors'/>
      </PanoramaSlider>
    </Frame>
  )
}
