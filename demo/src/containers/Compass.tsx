import { align, container, selectors } from 'promptu'
import React, { Fragment, PureComponent } from 'react'
import styled, { css } from 'styled-components'
import Compass from '../../../lib/Compass'
import DebugConsole from '../../../lib/DebugConsole'
import RangeSlider from '../../../lib/RangeSlider'
import Slider, { generateBreakpoints } from '../../../lib/Slider'

export interface Props {}

export interface State {
  index?: number
  max: number
  min: number
  position: number
}

export default class Container extends PureComponent<Props, State> {
  state: State = {
    max: 360,
    min: 0,
    position: 0.5,
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
            breakpoints={generateBreakpoints(10)}
            position={this.state.position}
            gutterPadding={10}
            isInverted={false}
            knobHeight={40}
            knobWidth={60}
            labelProvider={(p, i) => `${Math.round(this.getAngleByPosition(p))}°`}
            onIndexChange={index => this.setState({ index })}
            onPositionChange={position => this.setState({ position })}
            orientation='vertical'
            css={css`
              ${align.cc}
            `}
            labelCSS={css`
              font-size: 1.8rem;
              font-weight: 700;
            `}
            endingGutterCSS={css`
              background: grey;
            `}
            knobCSS={css`
              ${selectors.hwot} {
                transform: scale(1.2);
              }
            `}
            style={{
              height: `${this.state.max}px`,
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
          message={`Position: ${this.state.position.toFixed(3)}, Index: ${this.state.index}, Angle: ${Math.round(angle)}°, Min: ${Math.round(this.state.min)}, Max: ${Math.round(this.state.max)}`}
          style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
        />
      </Fragment>
    )
  }
}

const StyledRoot = styled.div`
  ${container.fhcc}
  height: 100%;
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
`
