import classNames from 'classnames'
import React, { HTMLAttributes, useEffect, useRef } from 'react'
import { Rect } from 'spase'
import styled, { css, CSSProp } from 'styled-components'
import useDragEffect from './hooks/useDragEffect'
import { Orientation } from './types'

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:slider') : () => {}

export type Props = HTMLAttributes<HTMLDivElement> & {
  /**
   * By default the position is a value from 0 - 1, 0 being the start of the slider and 1 being the
   * end. Switching on this flag inverts this behavior, where 0 becomes the end of the slider and 1
   * being the start.
   */
  isInverted?: boolean

  /**
   * Indicates if position change events are dispatched only when dragging ends. When disabled,
   * aforementioned events are fired repeatedly while dragging.
   */
  onlyDispatchesOnDragEnd?: boolean

  /**
   * A function that returns the label to be displayed at a given slider position.
   *
   * @param position - The current slider position.
   *
   * @returns The label.
   */
  labelProvider?: (position: number) => string

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
   * The current position.
   */
  position?: number

  /**
   * Handler invoked when position changes from dragging.
   *
   * @param position - The current slider position.
   */
  onPositionChange?: (position: number) => void

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
 * A slider component supporting both horizontal and vertical orientations whose sliding position (a
 * decimal between 0.0 and 1.0, inclusive) can be two-way binded. The component consists of four
 * customizable elements: a draggable knob, a label on the knob, a scroll track before the knob and
 * a scroll track after the knob. While the width and height of the slider is inferred from its CSS
 * rules, the width and height of the knob are set via props (`knobWidth` and `knobHeight`,
 * respectively). The size of the knob does not impact the size of the slider.
 *
 * @requires react
 * @requires styled-components
 * @requires spase
 * @requires interactjs
 */
export default function Slider({
  isInverted = false,
  onlyDispatchesOnDragEnd = false,
  trackPadding = 0,
  knobHeight = 30,
  knobWidth = 30,
  orientation = 'vertical',
  position: externalPosition = 0,
  labelProvider,
  onDragEnd,
  onDragStart,
  onPositionChange,
  startingTrackCSS,
  endingTrackCSS,
  knobCSS,
  labelCSS,
  ...props
}: Props) {
  function transform(currentPosition: number, dx: number, dy: number): number {
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

  const { isDragging: [isDragging], value: [position, setPosition] } = useDragEffect(knobRef, {
    initialValue: externalPosition,
    transform,
    onDragStart,
    onDragEnd,
  })

  // debug('Rendering...', 'OK')

  const naturalPosition = isInverted ? 1 - position : position

  // If position is changed externally, propagate that change to the drag effect state, but do not
  // interrupt if the slider is currently being dragged.
  useEffect(() => {
    if (isDragging || externalPosition === position) return
    debug('Updating drag effect position from position prop...', 'OK', `prop=${externalPosition}, effect=${position}`)
    setPosition(externalPosition)
  }, [externalPosition])

  // Emit position change event only if it was changed from internally.
  useEffect(() => {
    if (!isDragging) return
    if (onlyDispatchesOnDragEnd) return
    onPositionChange?.(position)
  }, [position])

  // Emit position change event after drag ends, if `onlyDispatchesOnDragEnd` is enabled.
  useEffect(() => {
    if (isDragging) return
    if (!onlyDispatchesOnDragEnd) return
    onPositionChange?.(position)
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
            'dragging': isDragging === true,
          })}
          css={knobCSS}
          style={{
            height: `${knobHeight}px`,
            width: `${knobWidth}px`,
          }}
        >
          {labelProvider && (
            <StyledLabel knobHeight={knobHeight} css={labelCSS}>{labelProvider(position)}</StyledLabel>
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
