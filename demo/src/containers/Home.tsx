import { align, container } from 'promptu';
import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';

export interface Props {}

export default hot(class extends PureComponent<Props> {
  render() {
    return (
      <StyledRoot>

      </StyledRoot>
    );
  }
});

const StyledRoot = styled.div`
  ${container.box}
  ${align.tl}
  width: 100%;
  height: 100%;
`;
