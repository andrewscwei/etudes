import React, { useState } from 'react'
import styled from 'styled-components'
import { DebugConsole } from '../../../lib/DebugConsole'
import { Dial, DialKnob, DialTrack } from '../../../lib/Dial'
import { RangeSlider, RangeSliderHighlight, RangeSliderKnob, RangeSliderLabel } from '../../../lib/RangeSlider'
import { Slider, SliderKnob, SliderLabel, SliderTrack } from '../../../lib/Slider'
import { StepwiseSlider, StepwiseSliderKnob, StepwiseSliderLabel, StepwiseSliderTrack } from '../../../lib/StepwiseSlider'

export function DialSlidersDemo() {
  const getAngleByPosition = (position: number): number => position * (max - min) + min

  const [min, setMin] = useState(0)
  const [max, setMax] = useState(360)
  const [index, setIndex] = useState(4)
  const [position, setPosition] = useState(0.5)
  const angle = getAngleByPosition(position)

  return (
    <>
      <StyledRoot>
        <StyledDial
          angle={angle}
          knobLength={50}
          radius={200}
          style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(-20deg)' }}
        >
          <DialKnob className='knob'/>
          <DialTrack className='track'/>
        </StyledDial>
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
          <SliderKnob className='knob'/>
          <SliderLabel className='label'/>
          <SliderTrack className='track'/>
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
          <StepwiseSliderKnob className='knob'/>
          <StepwiseSliderLabel className='label'/>
          <StepwiseSliderTrack className='track'/>
        </StyledStepwiseSlider>
      </StyledRoot>
      <StyledRangeSlider
        max={360}
        min={0}
        orientation='horizontal'
        range={[min, max]}
        steps={359}
        onRangeChange={range => {
          setMin(range[0])
          setMax(range[1])
        }}
      >
        <RangeSliderLabel className='label'/>
        <RangeSliderHighlight className='highlight'/>
        <RangeSliderKnob className='knob'/>
      </StyledRangeSlider>
      <DebugConsole
        maxEntries={1}
        message={`Position: ${position.toFixed(3)}, Size: ${index}, Angle: ${Math.round(angle)}°, Min: ${Math.round(min)}°, Max: ${Math.round(max)}°`}
        title='?: Dial+Sliders'
        style={{ transform: 'translate3d(0, 0, 0) rotateX(10deg) rotateY(30deg)' }}
      />
    </>
  )
}

const StyledDial = styled(Dial)`
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;

  .knob {
    stroke: #fff;
  }

  .track {
    stroke-dasharray: 4;
    stroke: #666;
  }
`

const StyledRangeSlider = styled(RangeSlider)`
  height: 4px;
  left: 0;
  margin: 0;
  margin: 8vh 4vw;
  position: fixed;
  top: 0;
  transform: translate3d(0, 0, 0) rotateX(20deg) rotateY(-20deg);
  width: 300px;

  .knob {
    align-items: center;
    background: #fff;
    border-radius: 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    height: 20px;
    justify-content: center;
    width: 20px;

    &:hover {
      transform: scale(1.1);
    }
  }

  .highlight {
    background: #fff;
  }

  .label {
    color: #fff;
    font-size: 20px;
    font-weight: 700;
    text-align: center;
    top: calc(100% + 10px);
    transition: all 100ms ease-out;
  }
`

const StyledStepwiseSlider = styled(StepwiseSlider)`
  bottom: 0;
  height: 300px;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  transform: translate3d(50px, 0, 0) rotateX(20deg) rotateY(-20deg);
  width: 4px;

  .knob {
    align-items: center;
    background: #fff;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    transition: all 100ms ease-out;

    &:hover {
      transform: scale(1.1);
    }
  }

  .label {
    font-size: 18px;
    font-weight: 700;
  }

  .track {
    background: #fff;

    &.end {
      background: #666;
    }
  }
`

const StyledSlider = styled(Slider)`
  bottom: 0;
  left: 0;
  margin: auto;
  position: absolute;
  right: 0;
  top: 0;
  transform: translate3d(-50px, 0, 0) rotateX(20deg) rotateY(-20deg);
  width: 4px;

  .knob {
    align-items: center;
    background: #fff;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;

    &:hover {
      transform: scale(1.1);
    }
  }

  .label {
    font-size: 18px;
    font-weight: 700;
  }

  .track {
    background: #fff;

    &.end {
      background: #666 !important;
    }

    &:hover {
      transform: scale(1.1);
    }
  }
`

const StyledRoot = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  height: 100%;
  justify-content: center;
  padding: 100px 30px;
  perspective: 800px;
  width: 100%;
`
