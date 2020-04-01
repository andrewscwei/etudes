/**
 * @file Client app root.
 */

import { container, selectors } from 'promptu';
import React, { Fragment, PureComponent, SFC } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import DebugConsole from '../../../lib/DebugConsole';
import VList, { RowProps } from '../../../lib/VList';

export interface Props {}

export interface State {
  selectedIndex: number;
}

const Row: SFC<RowProps<string>> = ({ data, isSelected, onClick }) => (
  <StyledRow isSelected={isSelected} onClick={() => onClick()}>{data}</StyledRow>
);

export default hot(class extends PureComponent<Props, State> {
  state: State = {
    selectedIndex: -1,
  };

  render() {
    return (
      <Fragment>
        <StyledRoot>
          <StyledVList
            data={[...new Array(60)].map((v, i) => `${i}`)}
            rowComponentClass={Row}
            isTogglable={true}
            shouldStaySelected={true}
            onRowSelectAt={idx => this.setState({ selectedIndex: idx })}
            onRowDeselectAt={idx => this.setState({ selectedIndex: -1 })}
          />
        </StyledRoot>
        <StyledDebugConsole margin={30} title='?: Vlist' message={this.state.selectedIndex > -1 ? `You selected row <strong>#${this.state.selectedIndex + 1}</strong>!` : 'No rows selected!'}/>
      </Fragment>
    );
  }
});

const StyledDebugConsole = styled(DebugConsole)`
  transform: translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg);
`;

const StyledRow = styled.button<{
  isSelected: boolean;
}>`
  ${container.fvcc}
  transition: all .1s ease-out;
  padding: 20px;
  width: 100%;
  background: ${props => props.isSelected ? '#fff' : '#e91e63'};
  color: ${props => props.isSelected ? '#000' : '#fff'};
  transform: translate3d(0, 0, 0) scale(1);
  transform-origin: center;
  font-size: 3rem;
  font-weight: 700;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 0) scale(1.1);
  }
`;

const StyledVList = styled(VList)`
  width: 80%;
  transform: translate3d(0, 0, 0) rotate3d(1, 1, 0, 10deg);
`;

const StyledRoot = styled.div`
  ${container.fvtc}
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
  height: 100%;
`;
