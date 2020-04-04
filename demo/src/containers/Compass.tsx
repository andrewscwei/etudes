import { align, container, selectors } from 'promptu';
import React, { Fragment, PureComponent } from 'react';
import { hot } from 'react-hot-loader/root';
import styled, { css } from 'styled-components';
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
          <Compass
            angle={this.state.position * 360}
            fov={50}
            radius={200}
            highlightColor='#2b14d4'
            style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(-20deg)' }}
          />
          <VSlider
            gutterPadding={10}
            onPositionChange={position => this.setState({ position })}
            breakpoints={VSlider.breakpointsFactory(180, (i, p) => `${Math.round(p * 360)}°`)}
            knobWidth={60}
            knobHeight={40}
            labelCSS={props => css`
              font-size: 1.8rem;
              font-weight: 700;
            `}
            knobCSS={props => css`
              ${selectors.hwot} {
                transform: scale(1.2);
              }
            `}
            style={{
              marginLeft: '3rem',
              transform: 'translate3d(0, 0, 0) rotateX(20deg) rotateY(-20deg)',
            }}
          />
        </StyledRoot>
        <DebugConsole
          title='?: Compass+VSlider'
          maxEntries={1}
          message={`Position: ${this.state.position.toFixed(3)}, Angle: ${Math.round(this.state.position * 360)}°`}
          style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
        />
      </Fragment>
    );
  }
});

const StyledRoot = styled.div`
  ${container.fhcc}
  height: 100%;
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
`;
