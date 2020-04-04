import { container, align } from 'promptu';
import React, { Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import Compass from '../../../src/Compass';
import DebugConsole from '../../../src/DebugConsole';
import VSlider from '../../../src/VSlider';

export interface Props {}

export interface State {
  position: number;
}

export default hot(class extends PureComponent<Props, State> {
  state: State = {
    position: 0,
  };

  render() {
    return (
      <Fragment>
        <StyledRoot>
          <StyledCompass
            angle={this.state.position * 360}
            fov={50}
            radius={200}
            highlightColor='#2b14d4'
            style={{
              transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(-20deg)',
            }}
          />
          <VSlider
            autoSnap={false}
            gutterPadding={10}
            onPositionChange={position => this.setState({ position })}
            style={{
              transform: 'translate3d(0, 0, 0) rotateX(20deg) rotateY(-20deg)',
            }}
          />
        </StyledRoot>
        <DebugConsole
          title='?: Compass + VSlider'
          maxEntries={1}
          message={`Position: ${this.state.position.toFixed(3)}, Angle: ${Math.round(this.state.position * 360)}°`}
          style={{
            transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)',
          }}
        />
      </Fragment>
    );
  }
});

const StyledCompass = styled(Compass)`
  ${align.cc}
`;

const StyledRoot = styled.div`
  ${container.fhcc}
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
  height: 100%;
`;
