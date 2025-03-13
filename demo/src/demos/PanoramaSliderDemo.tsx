import { PanoramaSlider, PanoramaSliderIndicator, PanoramaSliderReticle, PanoramaSliderTrack } from 'etudes'
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
        angle={angle}
        className='relative h-24'
        src={$$PanoramaImage}
        viewportSize={Size.make(500, 400)}
        zeroAnchor={zeroAnchor}
        onAngleChange={setAngle}
      >
        <PanoramaSliderIndicator className='dragging:bg-light bg-light/40 absolute inset-x-0 -bottom-2 mx-auto h-[2px]'/>
        <PanoramaSliderReticle className='dragging:bg-dark/0 bg-dark/20 h-full transition-colors'/>
        <PanoramaSliderTrack className='bg-dark/40 h-full transition-colors'/>
      </PanoramaSlider>
    </Frame>
  )
}
