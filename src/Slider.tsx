import classNames from 'classnames'
import interact from 'interactjs'
import React, { CSSProperties, useEffect, useRef, useState } from 'react'
import { Rect } from 'spase'
import styled, { css, CSSProp } from 'styled-components'
import { Orientation } from './types'

const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:slider') : () => {}

export type GutterCSSProps = Readonly<{
  orientation: Orientation
}>

export type LabelCSSProps = Readonly<{
  knobHeight: number
}>

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
   * Indicates if the label is visible by the knob. Note that this is only applicable if
   * `labelProvider` is set.
   */
  isLabelVisible?: boolean

  /**
   * A function that returns the label to be displayed (if `isLabelVisible` is `true`) at a given
   * slider position and cloest breakpoint index (if breakpoints are provided).
   *
   * @param position - The current slider position.
   * @praam index - The nearest breakpoint index (if breakpoints are provided), or -1 if no
   *                breakpoints are provided.
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
   * The current position. This is ignored if `index` and `breakpoints` are provided.
   */
  position?: number

  /**
   * Handler invoked when dragging ends.
   */
  onDragEnd?: () => void

  /**
   * Handler invoked when dragging begins.
   */
  onDragStart?: () => void

  /**
   * Handler invoked when position changes.
   *
   * @param position - The current slider position.
   */
  onPositionChange?: (position: number) => void

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

  // The following props are only used if `breakpoints` are provided.

  /**
   * An array of breakpoint descriptors. A breakpoint is a position (0 - 1 inclusive) on the gutter
   * where the knob should snap to if dragging stops near it. If breakpoints are to be specified,
   * ensure that there are at least two: one for the start of the gutter and one for the end.
   */
  breakpoints?: readonly number[]

  /**
   * Indicates whether the knob automatically snaps to the nearest breakpoint, if breakpoints are
   * provided.
   */
  autoSnap?: boolean

  /**
   * The current index. This is only used if breakpoints are provided. On the other hand, if
   * breakpoints are provided, the current position will be calculated based on this value, making
   * `position` irrelevant.
   */
  index?: number

  /**
   * Handler invoked when index changes. This happens simultaneously with `onPositionChange`. Note
   * that this is only invoked if breakpoints are provided, because otherwise there will be no
   * indexes.
   *
   * @param index - The current breakpoint index.
   */
  onIndexChange?: (index: number) => void
}

/**
 * Generates a set of breakpoints compatible with this component.
 *
 * @param length - The number of breakpoints. This must be at least 2 because you must include the
 *                 starting and ending points.
 *
 * @returns An array of breakpoints.
 */
export function generateBreakpoints(length: number): readonly number[] {
  if (length <= 1) throw new Error('`length` value must be greater than or equal to 2')
  if (Math.round(length) !== length) throw new Error('`length` value must be an integer')

  const interval = 1 / (length - 1)

  return Array(length).fill(null).map((v, i) => {
    const pos = interval * i
    return pos
  })
}

/**
 * Gets the index of the breakpoint of which the specified position is closest to. If for whatever
 * reason the index cannot be computed (i.e. no breakpoints were provided), -1 is returned.
 *
 * @param position - The position (0 - 1, inclusive).
 * @param breakpoints - The breakpoints.
 *
 * @returns The nearest index.
 */
export function getNearestBreakpointIndexByPosition(position: number, breakpoints: readonly number[]): number {
  let index = -1
  let minDelta = NaN

  for (let i = 0, n = breakpoints.length; i < n; i++) {
    const breakpoint = getBreakpointPositionAt(i, breakpoints)

    if (isNaN(breakpoint)) continue

    const delta = Math.abs(position - breakpoint)

    if (isNaN(minDelta) || (delta < minDelta)) {
      minDelta = delta
      index = i
    }
  }

  return index
}

/**
 * Gets the position of the breakpoint of which the specified position is closest to. If for
 * whatever reason the position cannot be computed (i.e. no breakpoints were provided), `NaN` is
 * returned.
 *
 * @param position - The position (0 - 1, inclusive).
 * @param breakpoints - The breakpoints.
 *
 * @returns The nearest breakpoint position.
 */
export function getNearestBreakpointPositionByPosition(position: number, breakpoints: readonly number[]): number {
  const nearestIndex = getNearestBreakpointIndexByPosition(position, breakpoints)
  return getBreakpointPositionAt(nearestIndex, breakpoints)
}

/**
 * Gets the position by breakpoint index. This value ranges between 0 - 1, inclusive.
 *
 * @param index - The breakpoint index.
 * @param breakpoints - The breakpoints.
 *
 * @returns The position. If for whatever reason the position cannot be determined, `NaN` is
 *          returned.
 */
export function getBreakpointPositionAt(index: number, breakpoints: readonly number[]): number {
  if (index >= breakpoints.length) return NaN
  return breakpoints[index]
}

/**
 * A slider component that divides the scroll gutter into two different elements—one that is before
 * the knob and one that is after the knob. This allows for individual styling customizations. The
 * width and height of the root element of this component is taken from the aggregated rect of both
 * gutter parts. The dimension of the knob itself does not impact that of the root element. In
 * addition to the tranditional behavior of a scrollbar, this component allows you to provide
 * breakpoints along the gutter so the knob can automatically snap to them (if feature is enabled)
 * when dragging ends near the breakpoint positions. You can also supply a label to each breakpoint
 * and have it display on the knob when the current position is close to the breakpoint. This
 * component supports both horizontal and vertical orientations.
 */
export default function Slider({
  id,
  className,
  style,
  isInverted = false,
  onlyDispatchesOnDragEnd = false,
  gutterPadding = 0,
  knobHeight = 30,
  knobWidth = 30,
  orientation = 'vertical',
  position = 0,
  isLabelVisible = true,
  labelProvider,
  onDragEnd,
  onDragStart,
  onPositionChange,
  startingGutterCSS,
  endingGutterCSS,
  knobCSS,
  labelCSS,
  breakpoints,
  autoSnap = true,
  index = -1,
  onIndexChange,
}: Props) {
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

    console.log(_position)

    livePosition.current = position

    _setPosition(position)

    if (breakpoints) {
      const index = getNearestBreakpointIndexByPosition(position, breakpoints)
      debug('Updating live position and index...', 'OK', position, index)
      _setIndex(index)
    }
    else {
      debug('Updating live position...', 'OK', position)
    }
  }

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
   * Handler invoked when the knob starts dragging.
   */
  function onKnobDragStart() {
    debug('Handling drag start...', 'OK')

    setIsDragging(true)

    onDragStart?.()
  }

  /**
   * Handler invoked when the knob moves.
   *
   * @param delta - The distance traveled (in pixels) since the last invocation of this handler.
   */
  function onKnobDragMove(delta: number) {
    const rect = Rect.from(rootRef.current) ?? new Rect()
    const naturalPosition = isInverted ? 1 - livePosition.current : livePosition.current
    const naturalNewPositionX = naturalPosition * rect.width + delta
    const naturalNewPositionY = naturalPosition * rect.height + delta
    const naturalNewPosition = (orientation === 'vertical') ? Math.max(0, Math.min(1, naturalNewPositionY / rect.height)) : Math.max(0, Math.min(1, naturalNewPositionX / rect.width))
    const newPosition = isInverted ? (1 - naturalNewPosition) : naturalNewPosition

    setIsDragging(true)
    setLivePosition(newPosition)
  }

  /**
   * Handler invoked when the knob stops dragging.
   */
  function onKnobDragStop() {
    debug('Handling drag stop...', 'OK')

    setIsDragging(false)

    onDragEnd?.()
  }

  /**
   * Snaps the knob to the closest breakpoint. Note that if there are no breakpoints or
   * auto-snapping feature is disabled, this method does nothing.
   */
  function snapToNearestBreakpointIfNeeded() {
    const position = breakpoints ? getNearestBreakpointPositionByPosition(livePosition.current, breakpoints) : NaN

    if (isNaN(position)) return

    debug('Snapping to nearest breakpoint...', 'OK')

    setLivePosition(position)
  }

  const rootRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLButtonElement>(null)

  const livePosition = useRef((breakpoints !== undefined && index > -1) ? getBreakpointPositionAt(index, breakpoints) : position)

  const [_position, _setPosition] = useState(livePosition.current)
  const [_index, _setIndex] = useState(breakpoints ? getNearestBreakpointIndexByPosition(livePosition.current, breakpoints) : index)
  const [isDragging, setIsDragging] = useState<boolean | undefined>(undefined)

  const naturalPosition = isInverted ? 1 - _position : _position

  useEffect(() => {
    initInteractivity()

    return () => {
      deinitInteractivity()
    }
  }, [])

  useEffect(() => {
    // If indexes are used, return.
    if (breakpoints && index > -1) return

    // If currently dragging, return.
    if (isDragging) return

    debug('Updating position from externally...', 'OK', position)

    setIsDragging(undefined)
    setLivePosition(position)
  }, [position])

  useEffect(() => {
    // If indexes aren't used, return.
    if (!breakpoints || index < 0) return

    // If currently dragging, return.
    if (isDragging) return

    const position = getBreakpointPositionAt(index, breakpoints)
    if (isNaN(position)) return

    debug('Updating index from externally...', 'OK', index)

    setIsDragging(undefined)
    setLivePosition(position)
  }, [index])

  useEffect(() => {
    if (onlyDispatchesOnDragEnd && isDragging) return
    onPositionChange?.(_position)
  }, [_position])

  useEffect(() => {
    if (onlyDispatchesOnDragEnd && isDragging) return
    onIndexChange?.(_index)
  }, [_index])

  useEffect(() => {
    if (isDragging !== false) return

    if (breakpoints && autoSnap) {
      snapToNearestBreakpointIfNeeded()
    }
    else if (onlyDispatchesOnDragEnd) {
      onPositionChange?.(_position)
      onIndexChange?.(_index)
    }
  }, [isDragging])

  useEffect(() => {
    snapToNearestBreakpointIfNeeded()
  }, [autoSnap])

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
          top: `${_position*100}%`,
          transition: isDragging === false ? 'top 100ms ease-out' : 'none',
        } : {
          left: `${_position*100}%`,
          top: '50%',
          transition: isDragging === false ? 'left 100ms ease-out' : 'none',
        }),
      }}>
        <StyledKnob
          className={classNames({
            'at-end': isInverted ? (_position === 0) : (_position === 1),
            'at-start': isInverted ? (_position === 1) : (_position === 0),
            'dragging': isDragging === true,
            'idle': isDragging === false,
          })}
          css={knobCSS}
          style={{
            height: `${knobHeight}px`,
            width: `${knobWidth}px`,
          }}
        >
          {breakpoints && isLabelVisible && labelProvider && (
            <StyledLabel knobHeight={knobHeight} css={labelCSS}>{labelProvider(_position, getNearestBreakpointIndexByPosition(_position, breakpoints))}</StyledLabel>
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

const StyledGutter = styled.div<GutterCSSProps>`
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

const StyledLabel = styled.label<LabelCSSProps>`
  color: #000;
  font-size: ${props => props.knobHeight * .5}px;
  pointer-events: none;
  user-select: none;

  ${props => props.css}
`

const StyledKnobContainer = styled.button`
  position: absolute;
  z-index: 1;
  transition-duration: 100ms;
  transition-property: top;
  transition-timing-function: ease-out;
`

const StyledKnob = styled.div`
  align-items: center;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: 1;
  touch-action: none;
  transition-duration: 100ms;
  transition-property: background, color, opacity, transform;
  transition-timing-function: ease-out;

  &.idle {
    opacity: 1;
    transition-property: background, color, opacity, margin, transform;
  }

  &.dragging {
    opacity: .6;
    transition-property: background, color, transform, opacity;
  }

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
