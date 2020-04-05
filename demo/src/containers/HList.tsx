import { container, selectors } from 'promptu';
import React, { Fragment, PureComponent, SFC } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import DebugConsole from '../../../src/DebugConsole';
import HList, { ColumnComponentProps } from '../../../src/HList';

export interface Props {}

export interface State {
  selectedIndex: number;
}

const Column: SFC<ColumnComponentProps<string>> = ({ data, isSelected, onClick }) => (
  <StyledColumn isSelected={isSelected ?? false} onClick={() => onClick?.()}>{data}</StyledColumn>
);

export default hot(class extends PureComponent<Props, State> {
  state: State = {
    selectedIndex: -1,
  };

  render() {
    return (
      <Fragment>
        <StyledRoot>
          <HList
            data={[...new Array(60)].map((v, i) => `${i + 1}`)}
            isTogglable={true}
            onDeselectAt={idx => this.setState({ selectedIndex: -1 })}
            onSelectAt={idx => this.setState({ selectedIndex: idx })}
            columnComponentType={Column}
            shouldStaySelected={true}
            padding={30}
            style={{
              height: '80%',
              minHeight: '400px',
              transform: 'translate3d(0, 0, 0) rotate3d(1, .1, 0, 10deg)',
            }}
          />
        </StyledRoot>
        <DebugConsole
          title='?: Hlist'
          message={this.state.selectedIndex > -1 ? `You selected column <strong>#${this.state.selectedIndex + 1}</strong>!` : 'No columns selected!'}
          style={{
            transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)',
          }}
        />
      </Fragment>
    );
  }
});

const StyledColumn = styled.button<{
  isSelected: boolean;
}>`
  ${container.fvcc}
  transition: all .1s ease-out;
  padding: 20px;
  width: 30rem;
  height: 100%;
  background: ${props => props.isSelected ? '#2b14d4' : '#fff'};
  color: ${props => props.isSelected ? '#fff' : '#000'};
  transform: translate3d(0, 0, 0) scale(1);
  transform-origin: center;
  font-size: 3rem;
  font-weight: 700;
  z-index: 0;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 0) scale(1.1);
    z-index: 1;
  }
`;

const StyledRoot = styled.div`
  ${container.fhcl}
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
  height: 100%;
`;
