import { align, container, selectors } from 'promptu'
import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import DebugConsole from '../../../lib/DebugConsole'
import Dial from '../../../lib/Dial'
import RangeSlider from '../../../lib/RangeSlider'
import Slider from '../../../lib/Slider'
import StepwiseSlider from '../../../lib/StepwiseSlider'

const debug = process.env.NODE_ENV === 'development' ? require('debug')('demo') : () => {}

export default function() {
  // debug('Rendering demo "dial+sliders"...', 'OK')

  function getAngleByPosition(position: number): number {
    return position * (max - min) + min
  }

  const [min, setMin] = useState(0)
  const [max, setMax] = useState(360)
  const [index, setIndex] = useState(9)
  const [position, setPosition] = useState(0.5)
  const angle = getAngleByPosition(position)

  return (
    <>
      <StyledRoot>
        <Dial
          angle={angle}
          knobLength={50}
          radius={200}
          css={css`
            ${align.cc}
          `}
          knobCSS={css`
            stroke: #fff;
          `}
          trackCSS={css`
            stroke: #666;
          `}
          style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(-20deg)' }}
        />
        <Slider
          isInverted={false}
          knobHeight={40}
          knobWidth={60}
          labelProvider={position => `${Math.round(getAngleByPosition(position))}°`}
          onlyDispatchesOnDragEnd={false}
          onPositionChange={position => setPosition(position)}
          orientation='vertical'
          position={position}
          trackPadding={10}
          css={css`
            ${align.cc}
          `}
          knobCSS={css`
            ${selectors.hwot} {
              transform: scale(1.2);
            }
          `}
          labelCSS={css`
            font-size: 1.8rem;
            font-weight: 700;
          `}
          endingTrackCSS={css`
            background: grey;
          `}
          style={{
            height: `${(index + 1) * 30}px`,
            transform: 'translate3d(-5rem, 0, 0) rotateX(20deg) rotateY(-20deg)',
          }}
        />
        <StepwiseSlider
          index={index}
          isInverted={true}
          knobHeight={40}
          knobWidth={60}
          labelProvider={(position, index) => `${index}`}
          onIndexChange={index => setIndex(index)}
          onlyDispatchesOnDragEnd={false}
          orientation='vertical'
          trackPadding={10}
          css={css`
            ${align.cc}
          `}
          knobCSS={css`
            ${selectors.hwot} {
              transform: scale(1.2);
            }
          `}
          labelCSS={css`
            font-size: 1.8rem;
            font-weight: 700;
          `}
          endingTrackCSS={css`
            background: grey;
          `}
          style={{
            transform: 'translate3d(5rem, 0, 0) rotateX(20deg) rotateY(-20deg)',
          }}
        />
      </StyledRoot>
      <RangeSlider
        defaultRange={[0, 360]}
        max={360}
        min={0}
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
        onRangeChange={range => {
          setMin(range[0])
          setMax(range[1])
        }}
        style={{
          margin: '8vh 4vw',
          transform: 'translate3d(0, 0, 0) rotateX(20deg) rotateY(-20deg)',
          position: 'fixed',
          top: '0',
          left: '0',
        }}
      />
      <DebugConsole
        maxEntries={1}
        message={`Position: ${position.toFixed(3)}, Size: ${index}, Angle: ${Math.round(angle)}°, Min: ${Math.round(min)}°, Max: ${Math.round(max)}°`}
        style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
        title='?: Dial+Sliders'
      />
    </>
  )
}

const StyledRoot = styled.div`
  ${container.fhcc}
  height: 100%;
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
`
