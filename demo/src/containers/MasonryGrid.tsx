/**
 * @file Client app root.
 */

import { container } from 'promptu';
import React, { Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import DebugConsole from '../../../src/DebugConsole';
import MasonryGrid from '../../../src/MasonryGrid';

export interface Props {}

export interface State {}

export default hot(class extends PureComponent<Props, State> {
  data = [...new Array(200)].map((v, i) => ({
    h: Math.floor(Math.random() * 6) + 1,
    b: Math.floor(Math.random() * 1) + 1,
  }));

  render() {
    return (
      <Fragment>
        <StyledRoot>
          <StyledMasonryGrid
            sections={6}
            verticalSpacing={30}
            horizontalSpacing={30}
          >
            {this.data.map((v, i) => (
              <StyledGridItem key={i} className={`h-${v.h} base-${v.b}`}>{i + 1}</StyledGridItem>
            ))}
          </StyledMasonryGrid>
        </StyledRoot>
        <DebugConsole
          title='?: Masonry Grid'
          style={{
            transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)',
          }}
        />
      </Fragment>
    );
  }
});

const StyledGridItem = styled.div`
  ${container.fvcc}
  background: #2b14d4;
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  padding: 20px;

  &.h-1 { height: 4rem; }
  &.h-2 { height: 8rem; }
  &.h-3 { height: 12rem; }
  &.h-4 { height: 16rem; }
  &.h-5 { height: 20rem; }
  &.h-6 { height: 24rem; }
`;

const StyledMasonryGrid = styled(MasonryGrid)`
  width: 80%;
  transform: translate3d(0, 0, 0) rotate3d(1, 1, 0, 2deg);
`;

const StyledRoot = styled.div`
  ${container.fvtc}
  perspective: 80rem;
  width: 100%;
`;
