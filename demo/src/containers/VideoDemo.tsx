import React from 'react'
import styled from 'styled-components'
import { DebugConsole } from '../../../lib/components/DebugConsole'
import { Video } from '../../../lib/components/Video'
import $$Video from '../assets/media/video.mp4'

export function VideoDemo() {
  return (
    <>
      <StyledRoot>
        <StyledVideo
          autoLoop={true}
          autoPlay={true}
          src={$$Video}
        />
      </StyledRoot>
      <DebugConsole
        style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
        title='?: Video'
      />
    </>
  )
}

const StyledVideo = styled(Video)`
  height: 100%;
  left: 0;
  margin: 0;
  object-fit: cover;
  position: absolute;
  top: 0;
  transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(10deg);
  width: 100%;
`

const StyledRoot = styled.div`
  box-sizing: border-box;
  display: block;
  height: 100%;
  overflow: hidden;
  padding: 30px;
  perspective: 800px;
  width: 100%;
`
