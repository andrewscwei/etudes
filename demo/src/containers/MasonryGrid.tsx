/**
 * @file Client app root.
 */

import { container } from 'promptu';
import React, { Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import MasonryGrid from '../../../lib/MasonryGrid';

export interface Props {}

export interface State {}

export default hot(class extends PureComponent<Props, State> {
  data = [...new Array(60)].map((v, i) => ({
    h: Math.floor(Math.random() * 6) + 1,
    b: Math.floor(Math.random() * 1) + 1,
  }));

  render() {
    return (
      <Fragment>
        <StyledRoot>
          <MasonryGrid sections={6} verticalSpacing={30} horizontalSpacing={30}>
            {this.data.map((v, i) => (
              <StyledGridItem key={i} className={`h-${v.h} base-${v.b}`}>{i}</StyledGridItem>
            ))}
          </MasonryGrid>
        </StyledRoot>
      </Fragment>
    );
  }
});

const StyledGridItem = styled.div`
  ${container.fvcc}
  padding: 20px;
  color: #fff;
  background: #e91e63;

  &.h-1 { height: 2rem; }
  &.h-2 { height: 4rem; }
  &.h-3 { height: 6rem; }
  &.h-4 { height: 8rem; }
  &.h-5 { height: 10rem; }
  &.h-6 { height: 12rem; }
`;

const StyledRoot = styled.div`
  ${container.box}
  padding: 3rem;
`;