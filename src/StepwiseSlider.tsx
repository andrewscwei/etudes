import classNames from 'classnames'
import interact from 'interactjs'
import React, { CSSProperties, useEffect, useRef, useState } from 'react'
import { Rect } from 'spase'
import styled, { css, CSSProp } from 'styled-components'
import { Orientation } from './types'

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:stepwise-slider') : () => {}

export type Props = {
  /**
   * ID attribute of the root element.
   */
  id?: string

  /**
   * Class attribute of the root element.
   */
  className?: string

  /**
   * Inline style attribute of the root element.
   */
  style?: CSSProperties

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
   * Padding between the gutter and the knob in pixels.
   */
  gutterPadding?: number

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
   * An array of step descriptors. A step is a position (0 - 1 inclusive) on the gutter where the
   * knob should snap to if dragging stops near it. Ensure that there are at least two steps: one
   * for the start of the gutter and one for the end.
   */
  steps?: readonly number[]

  /**
   * The current index.
   */
  index?: number

  /**
   * Handler invoked when index changes. This happens simultaneously with `onPositionChange`.
   *
   * @param index - The current step index.
   * @param isDragging - Indicates if the index change is triggered by dragging the slider..
   */
  onIndexChange?: (index: number, isDragging: boolean) => void

  /**
   * Handler invoked when position changes.
   *
   * @param position - The current slider position.
   * @param isDragging - Indicates if the position change is triggered by dragging the slider.
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
   * Custom CSS provided to the gutter before the knob.
   */
  startingGutterCSS?: CSSProp<any>

  /**
   * Custom CSS provided to the gutter after the knob.
   */
  endingGutterCSS?: CSSProp<any>

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
 * knob, a scroll gutter before the knob and a scroll gutter after the knob. While the width and
 * height of the slider is inferred from its CSS rules, the width and height of the knob are set via
 * props (`knobWidth` and `knobHeight`, respectively). The size of the knob does not impact the size
 * of the slider. While dragging, the slider still emits a position change event, where the position
 * is a decimal ranging between 0.0 and 1.0, inclusive.
 */
export default function StepwiseSlider({
  id,
  className,
  style,
  isInverted = false,
  onlyDispatchesOnDragEnd = false,
  gutterPadding = 0,
  knobHeight = 30,
  knobWidth = 30,
  orientation = 'vertical',
  labelProvider,
  onDragEnd,
  onDragStart,
  onPositionChange,
  startingGutterCSS,
  endingGutterCSS,
  knobCSS,
  labelCSS,
  steps = generateSteps(10),
  index = 0,
  onIndexChange,
}: Props) {
  /**
   * Initializes input interactivity of the knob.
   */
  function initInteractivity() {
    const knob = knobRef.current
    if (!knob || interact.isSet(knob)) return

    debug('Initializing interactivity...', 'OK')

    interact(knob).draggable({
      inertia: true,
      onstart: () => onKnobDragStart(),
      onmove: ({ dx, dy }) => onKnobDragMove(orientation === 'vertical' ? dy : dx),
      onend: () => onKnobDragStop(),
    })
  }

  /**
   * Deinitializes input interactivity of the knob.
   */
  function deinitInteractivity() {
    const knob = knobRef.current
    if (!knob || !interact.isSet(knob)) return

    debug('Deinitializing interactivity...', 'OK')

    interact(knob).unset()
  }

  /**
   * Handler invoked when the knob starts dragging. Note that this is an event listener and does not
   * have read access to component states.
   */
  function onKnobDragStart() {
    debug('Handling drag start...', 'OK')
    setIsDragging(true)
    onDragStart?.()
  }

  /**
   * Handler invoked when the knob moves. Note that this is an event listener and does not have read
   * access to component states.
   *
   * @param delta - The distance traveled (in pixels) since the last invocation of this handler.
   */
  function onKnobDragMove(delta: number) {
    const rect = Rect.from(rootRef.current) ?? new Rect()
    const naturalPosition = isInverted ? 1 - livePosition.current : livePosition.current
    const naturalNewPositionX = naturalPosition * rect.width + delta
    const naturalNewPositionY = naturalPosition * rect.height + delta
    const naturalNewPosition = (orientation === 'vertical') ? Math.max(0, Math.min(1, naturalNewPositionY / rect.height)) : Math.max(0, Math.min(1, naturalNewPositionX / rect.width))
    const newPosition = isInverted ? 1 - naturalNewPosition : naturalNewPosition
    const newIndex = getNearestIndexByPosition(newPosition, steps)

    setIsDragging(true)
    setLivePosition(newPosition)
    setLiveIndex(newIndex)
  }

  /**
   * Handler invoked when the knob stops dragging. Note that this is an event listener and does not
   * have read access to component states.
   */
  function onKnobDragStop() {
    debug('Handling drag stop...', 'OK')
    setIsDragging(false)
    onDragEnd?.()
  }

  /**
   * Sets the current live position. The live position is different from the position state value.
   * Because states are asynchronous by nature, this live position value is used to record position
   * changes when drag event happens. This position should be normalized. That is, inversion should
   * be taken care of prior to passing the new value to this method if `isInverted` is `true`.
   *
   * @param position - The value to set the live position to.
   */
  function setLivePosition(position: number) {
    if (livePosition.current === position) return
    livePosition.current = position
    // debug('Updating live position...', 'OK', position)
    _setPosition(position)
  }

  /**
   * Sets the current live index. The live index is different from the index state value. Because
   * states are asynchronous by nature, this live index value is used to record index changes when
   * drag event happens.
   *
   * @param index - The value to set the live index to.
   */
  function setLiveIndex(index: number) {
    if (liveIndex.current === index) return
    liveIndex.current = index
    // debug('Updating live index...', 'OK', index)
    _setIndex(index)
  }

  const rootRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLButtonElement>(null)

  const livePosition = useRef(getPositionAt(index, steps))
  const liveIndex = useRef(index)

  const [_position, _setPosition] = useState(livePosition.current)
  const [_index, _setIndex] = useState(liveIndex.current)
  const [isDragging, setIsDragging] = useState<boolean | undefined>(undefined)

  const naturalPosition = isInverted ? 1 - _position : _position

  useEffect(() => {
    initInteractivity()

    return () => {
      deinitInteractivity()
    }
  }, [])

  useEffect(() => {
    if (isDragging === true) return
    if (index === _index) return
    setIsDragging(undefined)
    setLivePosition(getPositionAt(index, steps))
    setLiveIndex(index)
  }, [index])

  useEffect(() => {
    if (isDragging === true && onlyDispatchesOnDragEnd) return
    onPositionChange?.(_position, isDragging !== undefined)
  }, [_position])

  useEffect(() => {
    if (isDragging === true && onlyDispatchesOnDragEnd) return
    onIndexChange?.(_index, isDragging !== undefined)
  }, [_index])

  useEffect(() => {
    if (isDragging !== false) return

    const nearestIndex = getNearestIndexByPosition(_position, steps)
    const nearestPosition = getPositionAt(nearestIndex, steps)
    setLivePosition(nearestPosition)

    if (onlyDispatchesOnDragEnd) {
      onIndexChange?.(_index, true)
    }
  }, [isDragging])

  return (
    <StyledRoot ref={rootRef} id={id} className={className} orientation={orientation} style={style}>
      <StyledGutter orientation={orientation} css={startingGutterCSS}
        style={orientation === 'vertical' ? {
          top: 0,
          height: `calc(${naturalPosition*100}% - ${knobHeight*.5}px - ${gutterPadding}px)`,
        } : {
          left: 0,
          width: `calc(${naturalPosition*100}% - ${knobWidth*.5}px - ${gutterPadding}px)`,
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
            'at-end': isInverted ? (_position === 0) : (_position === 1),
            'at-start': isInverted ? (_position === 1) : (_position === 0),
            'dragging': isDragging === true,
          })}
          css={knobCSS}
          style={{
            height: `${knobHeight}px`,
            width: `${knobWidth}px`,
          }}
        >
          {steps && labelProvider && (
            <StyledLabel knobHeight={knobHeight} css={labelCSS}>{labelProvider(_position, getNearestIndexByPosition(_position, steps))}</StyledLabel>
          )}
        </StyledKnob>
      </StyledKnobContainer>
      <StyledGutter orientation={orientation} css={endingGutterCSS}
        style={orientation === 'vertical' ? {
          bottom: 0,
          height: `calc(${(1 - naturalPosition)*100}% - ${knobHeight*.5}px - ${gutterPadding}px)`,
        } : {
          right: 0,
          width: `calc(${(1 - naturalPosition)*100}% - ${knobWidth*.5}px - ${gutterPadding}px)`,
        }}
      />
    </StyledRoot>
  )
}

const StyledGutter = styled.div<{ orientation: NonNullable<Props['orientation']> }>`
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
