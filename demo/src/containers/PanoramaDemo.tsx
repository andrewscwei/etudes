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
        <Slider
          isInverted={false}
          knobHeight={20}
          knobWidth={20}
          orientation='horizontal'
          position={(width - 400) / 400}
          style={{
            transform: 'translate3d(0, 0, 0) rotateX(0deg) rotateY(-10deg)',
            width: '40rem',
            height: '.4rem',
            maxWidth: '80%',
            marginBottom: '5rem',
          }}
          onPositionChange={position => { setWidth(400 + position * 400) }}
        >
          <SliderKnob style={{
            background: '#fff',
            borderRadius: `${20 * 0.5}px`,
          }}/>
        </Slider>
        <Panorama
          angle={angle}
          src={$$PanoramaImage}
          zeroAnchor={zeroAnchor}
          style={{
            height: '40rem',
            transform: 'translate3d(0, 0, 0) rotateX(0deg) rotateY(-10deg)',
            width: `${width}px`,
            maxWidth: '80%',
          }}
          onAngleChange={(value, isDragging) => { if (isDragging) setAngle(value) }}
          onResize={size => setViewportSize(size)}
        />
        <PanoramaSlider
          angle={angle}
          src={$$PanoramaImage}
          viewportSize={viewportSize}
          zeroAnchor={zeroAnchor}
          style={{
            marginTop: '3rem',
            height: '8rem',
            transform: 'translate3d(0, 0, 0) rotateX(0deg) rotateY(10deg)',
          }}
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

const StyledRoot = styled.div`
  ${container.fvcc}
  height: 100%;
  overflow: hidden;
  padding: 3rem;
  perspective: 80rem;
  width: 100%;
`
