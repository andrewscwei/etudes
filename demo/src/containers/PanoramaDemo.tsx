import { container } from 'promptu'
import React, { useState } from 'react'
import { Size } from 'spase'
import styled from 'styled-components'
import DebugConsole from '../../../lib/DebugConsole'
import Panorama from '../../../lib/Panorama'
import PanoramaSlider from '../../../lib/PanoramaSlider'
import Slider, { SliderKnob } from '../../../lib/Slider'
import $$PanoramaImage from '../assets/images/panorama.png'

export default function() {
  const [angle, setAngle] = useState(0)
  const [width, setWidth] = useState(800)
  const [viewportSize, setViewportSize] = useState(new Size())
  const [zeroAnchor] = useState(0.5)

  return (
    <>
      <StyledRoot>
        <StyledSlider
          isInverted={false}
          knobHeight={20}
          knobWidth={20}
          orientation='horizontal'
          position={(width - 400) / 400}
          onPositionChange={position => { setWidth(400 + position * 400) }}
        >
          <SliderKnob className='knob'/>
        </StyledSlider>
        <StyledPanorama
          angle={angle}
          src={$$PanoramaImage}
          zeroAnchor={zeroAnchor}
          style={{ width: `${width}px` }}
          onAngleChange={(value, isDragging) => { if (isDragging) setAngle(value) }}
          onResize={size => setViewportSize(size)}
        />
        <StyledPanoramaSlider
          angle={angle}
          src={$$PanoramaImage}
          viewportSize={viewportSize}
          zeroAnchor={zeroAnchor}
          onAngleChange={(value, isDragging) => { if (isDragging) setAngle(value) }}
        />
      </StyledRoot>
      <DebugConsole
        maxEntries={1}
        message={`Angle: ${Math.round(angle)}°`}
        title='?: Panorama+Slider'
        style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
      />
    </>
  )
}

const StyledSlider = styled(Slider)`
  height: .4rem;
  margin-bottom: 5rem;
  max-width: 80%;
  transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(-10deg);
  width: 40rem;

  .knob {
    background: #fff;
    border-radius: 10px;
  }
`

const StyledPanorama = styled(Panorama)`
  height: 40rem;
  transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(-10deg);
  max-width: 80%;
`

const StyledPanoramaSlider = styled(PanoramaSlider)`
  margin-top: 3rem;
  height: 8rem;
  transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(10deg);
`

const StyledRoot = styled.div`
  ${container.fvcc}
  height: 100%;
  overflow: hidden;
  padding: 3rem;
  perspective: 80rem;
  width: 100%;
`
