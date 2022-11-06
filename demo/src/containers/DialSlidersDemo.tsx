import { align, animations, container, selectors } from 'promptu'
import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import DebugConsole from '../../../lib/DebugConsole'
import Dial, { DialKnob, DialTrack } from '../../../lib/Dial'
import RangeSlider from '../../../lib/RangeSlider'
import Slider, { SliderKnob, SliderKnobLabel, SliderTrack } from '../../../lib/Slider'
import StepwiseSlider, { StepwiseSliderKnob, StepwiseSliderKnobLabel, StepwiseSliderTrack } from '../../../lib/StepwiseSlider'

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
        <StyledSlider
          isInverted={true}
          knobHeight={40}
          knobWidth={60}
          onlyDispatchesOnDragEnd={false}
          orientation='vertical'
          position={position}
          trackPadding={10}
          style={{ height: `${(index + 1) * 30}px` }}
          labelProvider={pos => `${Math.round(getAngleByPosition(pos))}°`}
          onPositionChange={pos => setPosition(pos)}
        >
          <SliderKnob className='hover:expand' style={{
            alignItems: 'center',
            background: '#fff',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center',
          }}/>
          <SliderKnobLabel style={{
            fontSize: '1.8rem',
            fontWeight: '700',
          }}/>
          <SliderTrack className='hover:expand' style={{
            background: '#fff',
          }}/>
        </StyledSlider>
        <StyledStepwiseSlider
          index={index}
          isInverted={true}
          isTrackInteractive={false}
          knobHeight={40}
          knobWidth={60}
          onlyDispatchesOnDragEnd={false}
          orientation='vertical'
          trackPadding={10}
          labelProvider={(pos, idx) => `${idx}`}
          onIndexChange={idx => setIndex(idx)}
        >
          <StepwiseSliderKnob className='hover:expand' style={{
            alignItems: 'center',
            background: '#fff',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center',
          }}/>
          <StepwiseSliderKnobLabel style={{
            fontSize: '1.8rem',
            fontWeight: '700',
          }}/>
          <StepwiseSliderTrack className='hover:expand' style={{
            background: '#fff',
          }}/>
        </StyledStepwiseSlider>
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
        title='?: Dial+Sliders'
        style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
      />
    </>
  )
}

const StyledStepwiseSlider = styled(StepwiseSlider)`
  ${align.cc}
  height: 30rem;
  transform: translate3d(5rem, 0, 0) rotateX(20deg) rotateY(-20deg);
  width: 4px;

  [class~='hover:expand'] {
    ${animations.transition('all', 100)}

    &.end {
      background: #666 !important;
    }

    ${selectors.hwot} {
      transform: scale(1.1);
    }
  }
`

const StyledSlider = styled(Slider)`
  ${align.cc}
  transform: translate3d(-5rem, 0, 0) rotateX(20deg) rotateY(-20deg);
  width: 4px;

  [class~='hover:expand'] {
    ${animations.transition('all', 100)}

    &.end {
      background: #666 !important;
    }

    ${selectors.hwot} {
      transform: scale(1.1);
    }
  }
`

const StyledRoot = styled.div`
  ${container.fhcc}
  height: 100%;
  padding: 10rem 3rem;
  perspective: 80rem;
  width: 100%;
`
