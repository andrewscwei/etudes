import { align, container } from 'promptu'
import React, { Fragment, PureComponent } from 'react'
import styled from 'styled-components'
import DebugConsole from '../../../src/DebugConsole'
import Video from '../../../src/Video'
import $$Video from '../assets/videos/video.mp4'

export interface Props {}

export interface State {}

export default class Container extends PureComponent<Props, State> {
  render() {
    return (
      <Fragment>
        <StyledRoot>
          <StyledVideo
            autoPlay={true}
            autoLoop={true}
            isCover={true}
            src={$$Video}
          />
        </StyledRoot>
        <DebugConsole
          title='?: Video'
          style={{
            transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)',
          }}
        />
      </Fragment>
    )
  }
}

const StyledVideo = styled(Video)`
  ${align.tl}
  width: 100%;
  height: 100%;
  transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(10deg);
`

const StyledRoot = styled.div`
  ${container.box}
  width: 100%;
  height: 100%;
  padding: 3rem;
  perspective: 80rem;
  overflow: hidden;
`
