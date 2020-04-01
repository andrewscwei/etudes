/**
 * @file Client app root.
 */

import { align, container } from 'promptu';
import React, { PureComponent, Fragment } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import Video from '../../../lib/Video';
import DebugConsole from '../../../lib/DebugConsole';

export interface Props {}

export interface State {}

export default hot(class extends PureComponent<Props, State> {
  render() {
    return (
      <Fragment>
        <StyledRoot>
          <StyledVideo
            autoPlay={true}
            autoLoop={true}
            isCover={true}
            src='https://storage.coverr.co/videos/coverr-car-in-desert-1585317576189?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjExNDMyN0NEOTRCMUFCMTFERTE3IiwiaWF0IjoxNTg1NzU1MzY4fQ.IHe_7XWcktHp4uGtErCLVac3MsiRKORjMrSmf5GWyuk'
          />
        </StyledRoot>
        <StyledDebugConsole margin={30} title='?: Video'/>
      </Fragment>
    );
  }
});

const StyledDebugConsole = styled(DebugConsole)`
  transform: translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg);
`;

const StyledVideo = styled(Video)`
  ${align.tl}
  width: 100%;
  height: 100%;
  transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(10deg);
`;

const StyledRoot = styled.div`
  ${container.box}
  width: 100%;
  height: 100%;
  padding: 3rem;
  perspective: 80rem;
  overflow: hidden;
`;
