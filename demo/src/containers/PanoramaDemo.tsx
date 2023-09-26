import React, { useState } from 'react'
import { Size } from 'spase'
import styled from 'styled-components'
import { DebugConsole } from '../../../lib/DebugConsole'
import { Panorama } from '../../../lib/Panorama'
import { PanoramaSlider } from '../../../lib/PanoramaSlider'
import { Slider, SliderKnob } from '../../../lib/Slider'
import $$PanoramaImage from '../assets/images/panorama.png'

export function PanoramaDemo() {
  const [angle, setAngle] = useState(0)
  const [width, setWidth] = useState(800)
  const [viewportSize, setViewportSize] = useState<Size>(new Size())
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
          style={{ width: `${width}px` }}
          angle={angle}
          src={$$PanoramaImage}
          zeroAnchor={zeroAnchor}
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
  height: 4px;
  margin-bottom: 50px;
  max-width: 80%;
  transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(-10deg);
  width: 400px;

  .knob {
    background: #fff;
    border-radius: 10px;
  }
`

const StyledPanorama = styled(Panorama)`
  height: 400px;
  max-width: 80%;
  transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(-10deg);
`

const StyledPanoramaSlider = styled(PanoramaSlider)`
  height: 80px;
  margin-top: 30px;
  transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(10deg);
`

const StyledRoot = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: center;
  overflow: hidden;
  padding: 30px;
  perspective: 800px;
  width: 100%;
`
