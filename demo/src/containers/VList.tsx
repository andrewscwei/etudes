/**
 * @file Client app root.
 */

import { align, container, selectors } from 'promptu';
import React, { PureComponent, SFC } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import VList, { RowProps } from '../../../lib/VList';

export interface Props {}

export interface State {}

const Row: SFC<RowProps<string>> = ({ data, isSelected, onClick }) => (
  <StyledRow onClick={() => onClick()}>{data}</StyledRow>
);

export default hot(class extends PureComponent<Props, State> {
  render() {
    return (
      <StyledRoot>
        <StyledVList
          data={[...new Array(60)].map((v, i) => `${i}`)}
          rowComponentClass={Row}
          onRowSelectAt={idx => console.log(`Selected: ${idx}`)}
          onRowDeselectAt={idx => console.log(`Deselected: ${idx}`)}
        />
      </StyledRoot>
    );
  }
});

const StyledRow = styled.button`
  ${container.fvcc}
  transition: all .1s ease-out;
  padding: 20px;
  color: #fff;
  width: 100%;
  background: #e91e63;
  transform: translate3d(0, 0, 0) scale(1);
  transform-origin: center;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 0) scale(1.2);
  }
`;

const StyledVList = styled(VList)`
  width: 80%;
`;

const StyledRoot = styled.div`
  ${container.fvtc}
  padding: 10rem 3rem;
`;
