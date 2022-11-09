import { align, container } from 'promptu'
import React from 'react'
import styled from 'styled-components'
import DebugConsole from '../../../lib/DebugConsole'
import Video from '../../../lib/Video'
import $$Video from '../assets/media/video.mp4'

export default function() {
  return (
    <>
      <StyledRoot>
        <StyledVideo
          autoLoop={true}
          autoPlay={true}
          isCover={true}
          src={$$Video}
        />
      </StyledRoot>
      <DebugConsole
        title='?: Video'
        style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
      />
    </>
  )
}

const StyledVideo = styled(Video)`
  ${align.tl}
  height: 100%;
  transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(10deg);
  width: 100%;
`

const StyledRoot = styled.div`
  ${container.box}
  height: 100%;
  overflow: hidden;
  padding: 3rem;
  perspective: 80rem;
  width: 100%;
`
