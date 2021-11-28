import { container } from 'promptu'
import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import DebugConsole from '../../../lib/DebugConsole'
import Panorama from '../../../lib/Panorama'
import Slider from '../../../lib/Slider'
import $$PanoramaImage from '../assets/images/panorama.jpg'

export default function() {
  const [angle, setAngle] = useState(0)
  const [width, setWidth] = useState(800)

  return (
    <>
      <StyledRoot>
        <Slider
          orientation='horizontal'
          position={(width - 400) / 400}
          onPositionChange={position => setWidth(400 + position * 400)}
          knobWidth={20}
          knobHeight={20}
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
          src={$$PanoramaImage}
          // angle={angle}
          zeroAnchor={0}
          onAngleChange={(angle, isDragging) => {
            setAngle(angle)
          }}
          onImageSizeChange={size => {
            // console.log('SIZE', size)
          }}
          onPositionChange={(position, isDragging) => {
            // console.log(`position=${position}, dragging=${isDragging}`)
          }}
          style={{
            height: '40rem',
            transform: 'translate3d(0, 0, 0) rotateX(0deg) rotateY(-10deg)',
            width: `${width}px`,
            maxWidth: '80%',
          }}
        />
        {/* <PanoramaSlider
          src={$$PanoramaImage}
          viewportSize={this.nodeRefs.panorama.current?.rect.size ?? new Size()}
          defaultAngle={this.props.defaultAngle}
          onAngleChange={angle => {
            this.setState({ angle })
            this.nodeRefs.panorama.current?.setAngle(angle)
          }}
          style={{
            marginTop: '3rem',
            height: '8rem',
            transform: 'translate3d(0, 0, 0) rotateX(0deg) rotateY(20deg)',
          }}
        /> */}
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
  width: 100%;
  height: 100%;
  padding: 3rem;
  perspective: 80rem;
  overflow: hidden;
`
