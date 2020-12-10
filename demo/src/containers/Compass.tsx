import { align, container, selectors } from 'promptu'
import React, { Fragment, PureComponent } from 'react'
import { hot } from 'react-hot-loader/root'
import styled, { css } from 'styled-components'
import Compass from '../../../src/Compass'
import DebugConsole from '../../../src/DebugConsole'
import RangeSlider from '../../../src/RangeSlider'
import Slider from '../../../src/Slider'

export interface Props {}

export interface State {
  position: number
  min: number
  max: number
}

export default hot(class Container extends PureComponent<Props, State> {
  state: State = {
    position: 0,
    min: 0,
    max: 360,
  }

  getAngleByPosition(position: number): number {
    return position * (this.state.max - this.state.min) + this.state.min
  }

  render() {
    const angle = this.getAngleByPosition(this.state.position)

    return (
      <Fragment>
        <StyledRoot>
          <Compass
            angle={angle}
            fov={50}
            radius={200}
            css={css`
              ${align.cc}
            `}
            highlightColor='#2b14d4'
            style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(-20deg)' }}
          />
          <Slider
            gutterPadding={10}
            onPositionChange={position => this.setState({ position })}
            breakpoints={Slider.breakpointsFactory(10, (i, p) => `${Math.round(this.getAngleByPosition(p))}°`)}
            knobWidth={60}
            knobHeight={40}
            isInverted={false}
            orientation='vertical'
            defaultPosition={0.6}
            css={css`
              ${align.cc}
            `}
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
              transform: 'translate3d(0, 0, 0) rotateX(20deg) rotateY(-20deg)',
            }}
          />
        </StyledRoot>
        <RangeSlider
          min={0}
          max={360}
          defaultRange={[0, 360]}
          orientation='horizontal'
          steps={359}
          tintColor='#fff'
          labelCSS={props => css`
            font-weight: 700;
            font-size: 2rem;
          `}
          knobCSS={props => css`
            ${selectors.hwot} {
              transform: scale(1.2);
            }
          `}
          onRangeChange={range => this.setState({ min: range[0], max: range[1] })}
          style={{
            margin: '8vh 4vw',
            transform: 'translate3d(0, 0, 0) rotateX(20deg) rotateY(-20deg)',
            position: 'fixed',
            top: '0',
            left: '0',
          }}
        />
        <DebugConsole
          title='?: Compass+Sliders'
          maxEntries={1}
          message={`Position: ${this.state.position.toFixed(3)}, Angle: ${Math.round(angle)}°, Min: ${Math.round(this.state.min)}, Max: ${Math.round(this.state.max)}`}
          style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
        />
      </Fragment>
    )
  }
})

const StyledRoot = styled.div`
  ${container.fhcc}
  height: 100%;
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
`
