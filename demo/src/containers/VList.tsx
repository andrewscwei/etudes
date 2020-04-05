import { container, selectors } from 'promptu';
import React, { Fragment, PureComponent, SFC } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import DebugConsole from '../../../src/DebugConsole';
import VList, { RowProps } from '../../../src/VList';

export interface Props {}

export interface State {
  selectedIndex: number;
}

const Row: SFC<RowProps<string>> = ({ data, isSelected, onClick, style }) => (
  <StyledRow isSelected={isSelected ?? false} onClick={() => onClick?.()} style={style}>{data}</StyledRow>
);

export default hot(class extends PureComponent<Props, State> {
  state: State = {
    selectedIndex: -1,
  };

  render() {
    return (
      <Fragment>
        <StyledRoot>
          <VList
            data={[...new Array(60)].map((v, i) => `${i + 1}`)}
            isTogglable={true}
            onDeselectAt={idx => this.setState({ selectedIndex: -1 })}
            onSelectAt={idx => this.setState({ selectedIndex: idx })}
            rowComponentType={Row}
            shouldStaySelected={true}
            padding={20}
            style={{
              width: '80%',
              minWidth: '400px',
              transform: 'translate3d(0, 0, 0) rotate3d(1, 1, 0, 10deg)',
            }}
          />
        </StyledRoot>
        <DebugConsole
          title='?: Vlist'
          message={this.state.selectedIndex > -1 ? `You selected row <strong>#${this.state.selectedIndex + 1}</strong>!` : 'No rows selected!'}
          style={{
            transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)',
          }}
        />
      </Fragment>
    );
  }
});

const StyledRow = styled.button<{
  isSelected: boolean;
}>`
  ${container.fvcc}
  background: ${props => props.isSelected ? '#2b14d4' : '#fff'};
  border-color: #fff;
  border-style: solid;
  color: ${props => props.isSelected ? '#fff' : '#000'};
  font-size: 3rem;
  font-weight: 700;
  padding: 20px;
  transform-origin: center;
  transform: translate3d(0, 0, 0) scale(1);
  transition: all .1s ease-out;
  width: 100%;
  z-index: 0;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 0) scale(1.1);
    z-index: 1;
  }
`;

const StyledRoot = styled.div`
  ${container.fvtc}
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
  height: 100%;
`;
