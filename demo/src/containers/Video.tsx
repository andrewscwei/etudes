/**
 * @file Client app root.
 */

import { align, container } from 'promptu';
import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import Video from '../../../lib/Video';

export interface Props {}

export interface State {}

export default hot(class extends PureComponent<Props, State> {
  render() {
    return (
      <StyledRoot>
        <StyledVideo
          autoPlay={true}
          autoLoop={true}
          isCover={true}
          src='https://storage.coverr.co/videos/coverr-car-in-desert-1585317576189?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjExNDMyN0NEOTRCMUFCMTFERTE3IiwiaWF0IjoxNTg1NzU1MzY4fQ.IHe_7XWcktHp4uGtErCLVac3MsiRKORjMrSmf5GWyuk'
        />
      </StyledRoot>
    );
  }
});

const StyledVideo = styled(Video)`
  ${align.tl}
  width: 100%;
  height: 100%;
`;

const StyledRoot = styled.div`
  ${container.box}
  padding: 3rem;
`;
