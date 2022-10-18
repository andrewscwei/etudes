import { align, container, selectors } from 'promptu'
import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import DebugConsole from '../../../lib/DebugConsole'
import Dial, { DialKnob, DialTrack } from '../../../lib/Dial'
import RangeSlider from '../../../lib/RangeSlider'
import Slider, { SliderEndingTrack, SliderKnob, SliderKnobLabel, SliderStartingTrack } from '../../../lib/Slider'
import StepwiseSlider, { StepwiseSliderEndingTrack, StepwiseSliderKnob, StepwiseSliderKnobLabel } from '../../../lib/StepwiseSlider'

export default function() {
  const getAngleByPosition = (position: number): number => position * (max - min) + min

  const [min, setMin] = useState(0)
  const [max, setMax] = useState(360)
  const [index, setIndex] = useState(4)
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
            ${DialKnob} {
              stroke: #fff;
            }
            ${DialTrack} {
              stroke: #666;
            }
          `}
          style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(-20deg)' }}
        />
        <Slider
          isInverted={true}
          knobHeight={40}
          knobWidth={60}
          labelProvider={pos => `${Math.round(getAngleByPosition(pos))}°`}
          onlyDispatchesOnDragEnd={false}
          onPositionChange={pos => setPosition(pos)}
          orientation='vertical'
          position={position}
          trackPadding={10}
          css={css`
            ${align.cc}
            ${SliderKnob} {
              ${selectors.hwot} { transform: scale(1.2); }
            }
            ${SliderKnobLabel} {
              font-size: 1.8rem;
              font-weight: 700;
            }
            ${SliderStartingTrack} {
              ${selectors.hwot} { transform: scale(1.1); }
            }
            ${SliderEndingTrack} {
              background: grey;
              ${selectors.hwot} { transform: scale(1.1); }
            }
          `}
          style={{
            height: `${(index + 1) * 30}px`,
            transform: 'translate3d(-5rem, 0, 0) rotateX(20deg) rotateY(-20deg)',
          }}
        />
        <StepwiseSlider
          index={index}
          isInverted={true}
          isTrackInteractive={false}
          knobHeight={40}
          knobWidth={60}
          labelProvider={(pos, idx) => `${idx}`}
          onIndexChange={idx => setIndex(idx)}
          onlyDispatchesOnDragEnd={false}
          orientation='vertical'
          trackPadding={10}
          css={css`
            ${align.cc}
            ${StepwiseSliderKnob} {
              ${selectors.hwot} { transform: scale(1.2); }
            }
            ${StepwiseSliderKnobLabel} {
              font-size: 1.8rem;
              font-weight: 700;
            }
            ${StepwiseSliderEndingTrack} {
              background: grey;
              ${selectors.hwot} { transform: scale(1.1); }
            }
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
        cssLabel={props => css`
          font-weight: 700;
          font-size: 2rem;
        `}
        cssKnob={props => css`
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
