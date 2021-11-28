import { container } from 'promptu'
import React, { useState } from 'react'
import { Size } from 'spase'
import styled, { css } from 'styled-components'
import DebugConsole from '../../../lib/DebugConsole'
import Panorama from '../../../lib/Panorama'
import PanoramaSlider from '../../../lib/PanoramaSlider'
import Slider from '../../../lib/Slider'
import $$PanoramaImage from '../assets/images/panorama.jpg'

export default function() {
  const [angle, setAngle] = useState(0)
  const [width, setWidth] = useState(800)
  const [viewportSize, setViewportSize] = useState(new Size())
  const [zeroAnchor] = useState(0.5)

  return (
    <>
      <StyledRoot>
        <Slider
          knobHeight={20}
          knobWidth={20}
          onPositionChange={position => setWidth(400 + position * 400)}
          orientation='horizontal'
          position={(width - 400) / 400}
          knobCSS={css`
            border-radius: 10px;
          `}
          endingTrackCSS={css`
            opacity: .6;
          `}
          style={{
            transform: 'translate3d(0, 0, 0) rotateX(0deg) rotateY(-10deg)',
            width: '40rem',
            maxWidth: '80%',
            marginBottom: '5rem',
          }}
        />
        <Panorama
          angle={angle}
          onAngleChange={angle => setAngle(angle) }
          onResize={size => setViewportSize(size)}
          src={$$PanoramaImage}
          zeroAnchor={zeroAnchor}
          style={{
            height: '40rem',
            transform: 'translate3d(0, 0, 0) rotateX(0deg) rotateY(-10deg)',
            width: `${width}px`,
            maxWidth: '80%',
          }}
        />
        <PanoramaSlider
          angle={angle}
          onAngleChange={angle => setAngle(angle)}
          src={$$PanoramaImage}
          viewportSize={viewportSize}
          zeroAnchor={zeroAnchor}
          style={{
            marginTop: '3rem',
            height: '8rem',
            transform: 'translate3d(0, 0, 0) rotateX(0deg) rotateY(10deg)',
          }}
        />
      </StyledRoot>
      <DebugConsole
        title='?: Panorama+Slider'
        maxEntries={1}
        message={`Angle: ${Math.round(angle)}°`}
        style={{
          transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)',
        }}
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
