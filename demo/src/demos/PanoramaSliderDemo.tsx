import { PanoramaSlider, PanoramaSliderIndicator, PanoramaSliderReticle, PanoramaSliderTrack } from 'etudes/components/PanoramaSlider'
import { useState } from 'react'
import { Size } from 'spase'
import $$PanoramaImage from '../assets/images/panorama.png'
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
        <PanoramaSliderIndicator className='dragging:bg-bg bg-bg/40 absolute inset-x-0 -bottom-2 mx-auto h-[2px]'/>
        <PanoramaSliderReticle className='dragging:bg-black/0 h-full bg-black/20 transition-colors'/>
        <PanoramaSliderTrack className='h-full bg-black/40 transition-colors'/>
      </PanoramaSlider>
    </Frame>
  )
}
