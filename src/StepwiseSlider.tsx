import classNames from 'classnames'
import React, { HTMLAttributes, useEffect, useRef, useState } from 'react'
import { Rect } from 'spase'
import styled, { css, CSSProp } from 'styled-components'
import useDragEffect from './hooks/useDragEffect'
import { Orientation } from './types'

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:stepwise-slider') : () => {}

export type Props = HTMLAttributes<HTMLDivElement> & {
  /**
   * By default the position is a value from 0 - 1, 0 being the start of the slider and 1 being the
   * end. Switching on this flag inverts this behavior, where 0 becomes the end of the slider and 1
   * being the start.
   */
  isInverted?: boolean

  /**
   * Indicates if position/index change events are dispatched only when dragging ends. When
   * disabled, aforementioned events are fired repeatedly while dragging.
   */
  onlyDispatchesOnDragEnd?: boolean

  /**
   * A function that returns the label to be displayed at a given slider position and closest step
   * index (if steps are provided).
   *
   * @param position - The current slider position.
   * @param index - The nearest step index (if steps are provided), or -1 if no steps are provided.
   *
   * @returns The label.
   */
  labelProvider?: (position: number, index: number) => string

  /**
   * Padding between the track and the knob in pixels.
   */
  trackPadding?: number

  /**
   * Height of the knob in pixels.
   */
  knobHeight?: number

  /**
   * Width of the knob in pixels.
   */
  knobWidth?: number

  /**
   * Orientation of the slider.
   */
  orientation?: Orientation

  /**
   * An array of step descriptors. A step is a position (0 - 1 inclusive) on the track where the
   * knob should snap to if dragging stops near it. Ensure that there are at least two steps: one
   * for the start of the track and one for the end.
   */
  steps?: readonly number[]

  /**
   * The current index.
   */
  index?: number

  /**
   * Handler invoked when index changes. This can either be invoked from the `index` prop
   * being changed or from the slider being dragged. Note that if the event is emitted at the end of
   * dragging due to `onlyDispatchesOnDragEnd` set to `true`, the `isDragging` parameter here is
   * still `true`. This event is emitted right after `onPositionChange`.
   *
   * @param index - The current slider index.
   * @param isDragging - Specifies if the index change is due to dragging.
   */
  onIndexChange?: (index: number, isDragging: boolean) => void

  /**
   * Handler invoked when position changes. This can either be invoked from the `index` prop
   * being changed or from the slider being dragged. Note that if the event is emitted at the end of
   * dragging due to `onlyDispatchesOnDragEnd` set to `true`, the `isDragging` parameter here is
   * still `true`. This event is emitted right before `onIndexChange`.
   *
   * @param position - The current slider position.
   * @param isDragging - Specifies if the position change is due to dragging.
   */
  onPositionChange?: (position: number, isDragging: boolean) => void

  /**
   * Handler invoked when dragging ends.
   */
  onDragEnd?: () => void

  /**
   * Handler invoked when dragging begins.
   */
  onDragStart?: () => void

  /**
   * Custom CSS provided to the track before the knob.
   */
  startingTrackCSS?: CSSProp<any>

  /**
   * Custom CSS provided to the track after the knob.
   */
  endingTrackCSS?: CSSProp<any>

  /**
   * Custom CSS provided to the knob.
   */
  knobCSS?: CSSProp<any>

  /**
   * Custom CSS provided to the label inside the knob.
   */
  labelCSS?: CSSProp<any>
}

/**
 * Generates a set of steps compatible with this component.
 *
 * @param length - The number of steps. This must be at least 2 because you must include the
 *                 starting and ending points.
 *
 * @returns An array of steps.
 */
export function generateSteps(length: number): readonly number[] {
  if (length <= 1) throw new Error('`length` value must be greater than or equal to 2')
  if (Math.round(length) !== length) throw new Error('`length` value must be an integer')

  const interval = 1 / (length - 1)

  return Array(length).fill(null).map((v, i) => {
    const position = interval * i
    return position
  })
}

/**
 * Gets the index of the step of which the specified position is closest to. If for whatever
 * reason the index cannot be computed, -1 is returned.
 *
 * @param position - The position (0 - 1, inclusive).
 * @param steps - The steps.
 *
 * @returns The nearest index.
 */
export function getNearestIndexByPosition(position: number, steps: readonly number[]): number {
  let index = -1
  let minDelta = NaN

  for (let i = 0, n = steps.length; i < n; i++) {
    const step = getPositionAt(i, steps)

    if (isNaN(step)) continue

    const delta = Math.abs(position - step)

    if (isNaN(minDelta) || (delta < minDelta)) {
      minDelta = delta
      index = i
    }
  }

  return index
}

/**
 * Gets the position by step index. This value ranges between 0 - 1, inclusive.
 *
 * @param index - The step index.
 * @param steps - The steps.
 *
 * @returns The position. If for whatever reason the position cannot be determined, `NaN` is
 *          returned.
 */
export function getPositionAt(index: number, steps: readonly number[]): number {
  if (index >= steps.length) return NaN
  return steps[index]
}

/**
 * A "stepwise" slider component supporting both horizontal and vertical orientations that
 * automatically snaps to a set of predefined points on the slider when dragged. These points are
 * referred to as "steps", indexed by an integer referred to as "index". This index can be two-way
 * binded. The component consists of four customizable elements: a draggable knob, a label on the
 * knob, a scroll track before the knob and a scroll track after the knob. While the width and
 * height of the slider is inferred from its CSS rules, the width and height of the knob are set via
 * props (`knobWidth` and `knobHeight`, respectively). The size of the knob does not impact the size
 * of the slider. While dragging, the slider still emits a position change event, where the position
 * is a decimal ranging between 0.0 and 1.0, inclusive.
 *
 * @requires react
 * @requires styled-components
 * @requires spase
 * @requires interactjs
 */
export default function StepwiseSlider({
  id,
  className,
  isInverted = false,
  onlyDispatchesOnDragEnd = false,
  trackPadding = 0,
  knobHeight = 30,
  knobWidth = 30,
  orientation = 'vertical',
  labelProvider,
  steps = generateSteps(10),
  index: externalIndex = 0,
  onIndexChange,
  onPositionChange,
  onDragEnd,
  onDragStart,
  startingTrackCSS,
  endingTrackCSS,
  knobCSS,
  labelCSS,
  ...props
}: Props) {
  function transform(currentPosition: number, dx: number, dy: number) {
    const rect = Rect.from(rootRef.current) ?? new Rect()
    const naturalPosition = isInverted ? 1 - currentPosition : currentPosition
    const naturalNewPositionX = naturalPosition * rect.width + dx
    const naturalNewPositionY = naturalPosition * rect.height + dy
    const naturalNewPosition = (orientation === 'vertical') ? Math.max(0, Math.min(1, naturalNewPositionY / rect.height)) : Math.max(0, Math.min(1, naturalNewPositionX / rect.width))
    const newPosition = isInverted ? 1 - naturalNewPosition : naturalNewPosition
    return newPosition
  }

  const rootRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLButtonElement>(null)

  const [index, setIndex] = useState(externalIndex)

  const { isDragging: [isDragging], value: [position, setPosition] } = useDragEffect(knobRef, {
    initialValue: getPositionAt(externalIndex, steps),
    transform,
    onDragStart,
    onDragEnd,
  })

  const naturalPosition = isInverted ? 1 - position : position

  useEffect(() => {
    if (isDragging) return

    const newPosition = getPositionAt(externalIndex, steps)

    if (position !== newPosition) {
      debug('Updating drag effect value from index prop...', 'OK', `prop=${newPosition}, effect=${position}`)
      setPosition(newPosition)
    }

    if (externalIndex !== index) {
      setIndex(externalIndex)
    }
  }, [externalIndex])

  useEffect(() => {
    if (isDragging && onlyDispatchesOnDragEnd) return

    onPositionChange?.(position, isDragging)

    const newIndex = getNearestIndexByPosition(position, steps)
    if (index !== newIndex) setIndex(newIndex)
  }, [position])

  useEffect(() => {
    onIndexChange?.(index, isDragging)
  }, [index])

  useEffect(() => {
    if (isDragging) return

    const nearestIndex = getNearestIndexByPosition(position, steps)
    const nearestPosition = getPositionAt(nearestIndex, steps)

    if (nearestPosition !== position || onlyDispatchesOnDragEnd) {
      setPosition(nearestPosition)
      onPositionChange?.(nearestPosition, true)
    }
  }, [isDragging])

  return (
    <StyledRoot ref={rootRef} orientation={orientation} {...props}>
      <StyledTrack orientation={orientation} css={startingTrackCSS}
        style={orientation === 'vertical' ? {
          top: 0,
          height: `calc(${naturalPosition*100}% - ${knobHeight*.5}px - ${trackPadding}px)`,
        } : {
          left: 0,
          width: `calc(${naturalPosition*100}% - ${knobWidth*.5}px - ${trackPadding}px)`,
        }}
      />
      <StyledKnobContainer ref={knobRef} style={{
        transform: 'translate3d(-50%, -50%, 0)',
        ...(orientation === 'vertical' ? {
          left: '50%',
          top: `${naturalPosition*100}%`,
          transition: isDragging === false ? 'top 100ms ease-out' : 'none',
        } : {
          left: `${naturalPosition*100}%`,
          top: '50%',
          transition: isDragging === false ? 'left 100ms ease-out' : 'none',
        }),
      }}>
        <StyledKnob
          className={classNames({
            'at-end': isInverted ? (position === 0) : (position === 1),
            'at-start': isInverted ? (position === 1) : (position === 0),
            'dragging': isDragging,
          })}
          css={knobCSS}
          style={{
            height: `${knobHeight}px`,
            width: `${knobWidth}px`,
          }}
        >
          {steps && labelProvider && (
            <StyledLabel knobHeight={knobHeight} css={labelCSS}>{labelProvider(position, getNearestIndexByPosition(position, steps))}</StyledLabel>
          )}
        </StyledKnob>
      </StyledKnobContainer>
      <StyledTrack orientation={orientation} css={endingTrackCSS}
        style={orientation === 'vertical' ? {
          bottom: 0,
          height: `calc(${(1 - naturalPosition)*100}% - ${knobHeight*.5}px - ${trackPadding}px)`,
        } : {
          right: 0,
          width: `calc(${(1 - naturalPosition)*100}% - ${knobWidth*.5}px - ${trackPadding}px)`,
        }}
      />
    </StyledRoot>
  )
}

const StyledTrack = styled.div<{ orientation: NonNullable<Props['orientation']> }>`
  background: #fff;
  position: absolute;

  ${props => props.orientation === 'vertical' ? css`
    left: 0;
    margin: 0 auto;
    right: 0;
    width: 100%;
  ` : css`
    bottom: 0;
    height: 100%;
    margin: auto 0;
    top: 0;
  `}

  ${props => props.css}
`

const StyledLabel = styled.label<{ knobHeight: NonNullable<Props['knobHeight']> }>`
  color: #000;
  font-size: ${props => props.knobHeight * .5}px;
  pointer-events: none;
  user-select: none;

  ${props => props.css}
`

const StyledKnobContainer = styled.button`
  position: absolute;
  z-index: 1;
`

const StyledKnob = styled.div`
  align-items: center;
  background: #fff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: 1;
  touch-action: none;
  transition-duration: 100ms;
  transition-property: background, color, opacity, transform;
  transition-timing-function: ease-out;

  ${props => props.css}
`

const StyledRoot = styled.div<{
  orientation: Orientation
}>`
  box-sizing: border-box;
  display: block;
  height: ${props => props.orientation === 'vertical' ? '300px' : '4px'};
  position: relative;
  width: ${props => props.orientation === 'vertical' ? '4px' : '300px'};
`
