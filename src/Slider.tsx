import classNames from 'classnames'
import interact from 'interactjs'
import React, { CSSProperties, useEffect, useRef, useState } from 'react'
import { Rect } from 'spase'
import styled, { css, CSSProp } from 'styled-components'
import { Orientation } from './types'

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
   * The default position. This is ignored if `defaultIndex` and breakpoints are provided.
   */
  defaultPosition?: number

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
   * The default index. This is only used if breakpoints are provided. On the other hand, if
   * breakpoints are provided, the default position will be calculated based on this value, making
   * `defaultPosition` irrelevant.
   */
  defaultIndex?: number

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
  defaultPosition = 0,
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
  defaultIndex,
  onIndexChange,
}: Props) {
  /**
   * Updates the calculated rect of this slider. If the root element is not rendered yet, the
   * calculated rect will be zero.
   */
  function updateRect() {
    setRect(Rect.from(rootRef.current) ?? new Rect())
  }

  /**
   * Updates the current knob position of the slider.
   */
  function updateKnobPosition() {
    if (!rect) return

    const naturalPosition = getPosition(true)

    if (orientation === 'vertical') {
      setKnobPosition(naturalPosition * rect.height)
    }
    else {
      setKnobPosition(naturalPosition * rect.width)
    }
  }

  /**
   * Gets the current position. If `natural` is `true`, the uninverted (if `isInverted` is set to
   * `true`) position will be returned.
   *
   * @param natural - Specifies if the natural position should be returned in case `isInverted` is
   *                  specified.
   *
   * @returns The current position.
   */
  function getPosition(natural = false): number {
    if (natural) {
      return isInverted ? (1 - position.current) : position.current
    }
    else {
      return position.current
    }
  }

  /**
   * Sets the current position. The position should be normalized. That is, inversion should be
   * taken care of prior to passing the new value to this method if `isInverted` is `true`.
   *
   * @param value - The value to set the position to.
   */
  function setPosition(value: number) {
    position.current = value
    updateKnobPosition()

    if (onlyDispatchesOnDragEnd && isDragging) return

    onPositionChange?.(position.current)

    if (breakpoints) onIndexChange?.(getClosestIndex())
  }

  /**
   * Length of the gutter before the knob in pixels. If the orientation of the slider is horizontal,
   * this refers to the width, else this refers to the height.
   *
   * @returns The gutter length.
   */
  function getStartingGutterLength(): number {
    if (!rect) return 0

    const naturalPosition = getPosition(true)
    const knobLength = orientation === 'vertical' ? knobHeight : knobWidth
    const sliderLength = orientation === 'vertical' ? rect.height : rect.width
    return Math.max(0, naturalPosition * sliderLength - (knobLength / 2) - gutterPadding)
  }

  /**
   * Length of the gutter after the knob in pixels. If the orientation of the slider is horizontal,
   * this refers to the width, else this refers to the height.
   *
   * @returns The gutter length.
   */
  function getEndingGutterLength(): number {
    if (!rect) return 0

    const naturalPosition = getPosition(true)
    const knobLength = orientation === 'vertical' ? knobHeight : knobWidth
    const sliderLength = orientation === 'vertical' ? rect.height : rect.width
    return Math.max(0, (1 - naturalPosition) * sliderLength - (knobLength / 2) - gutterPadding)
  }

  /**
   * Gets the index of the breakpoint of which the current position is closest to. If for whatever
   * reason the index cannot be computed (i.e. no breakpoints were provided), -1 is returned.
   *
   * @returns The closest index.
   */
  function getClosestIndex(): number {
    if (!breakpoints) return -1

    let idx = 0
    let delta = NaN

    for (let i = 0, n = breakpoints.length; i < n; i++) {
      const breakpoint = getPositionByIndex(i)
      const d = Math.abs(getPosition() - breakpoint)

      if (isNaN(delta) || (d < delta)) {
        delta = d
        idx = i
      }
    }

    return idx
  }

  /**
   * Gets the position by breakpoint index. This value ranges between 0 - 1, inclusive.
   *
   * @param index - The breakpoint index.
   *
   * @returns The position. If for whatever reason the position cannot be determined, NaN is
   *          returned.
   */
  function getPositionByIndex(index: number): number {
    if (!breakpoints) return NaN
    return breakpoints[index] ?? (index / (breakpoints.length - 1))
  }

  /**
   * Initializes input interactivity of the knob.
   */
  function initInteractivity() {
    const knob = knobRef.current
    if (!knob || interact.isSet(knob)) return

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
    if (!knob) return

    interact(knob).unset()
  }

  /**
   * Handler invoked when the knob starts dragging.
   */
  function onKnobDragStart() {
    setIsDragging(true)

    onDragStart?.()
  }

  /**
   * Handler invoked when the knob moves.
   *
   * @param delta - The distance traveled (in pixels) since the last invocation of this handler.
   */
  function onKnobDragMove(delta: number) {
    if (!rect) return

    const naturalPosition = getPosition(true)
    const naturalNewPositionX = naturalPosition * rect.width + delta
    const naturalNewPositionY = naturalPosition * rect.height + delta
    const naturalNewPosition = (orientation === 'vertical') ? Math.max(0, Math.min(1, naturalNewPositionY / rect.height)) : Math.max(0, Math.min(1, naturalNewPositionX / rect.width))
    const newPosition = isInverted ? (1 - naturalNewPosition) : naturalNewPosition

    setIsDragging(true)

    setPosition(newPosition)
  }

  /**
   * Handler invoked when the knob stops dragging.
   */
  function onKnobDragStop() {
    setIsDragging(false)
    snapToClosestBreakpointIfNeeded()

    onDragEnd?.()
  }

  /**
   * Snaps the knob to the closest breakpoint. Note that if there are no breakpoints or
   * auto-snapping feature is disabled, this method does nothing.
   */
  function snapToClosestBreakpointIfNeeded() {
    if (!autoSnap || !breakpoints) return
    const position = getPositionByIndex(getClosestIndex())
    setPosition(position)
  }

  const rootRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const position = useRef(((breakpoints !== undefined) && (defaultIndex !== undefined)) ? getPositionByIndex(defaultIndex) : defaultPosition)

  const [rect, setRect] = useState<Rect | undefined>(undefined)
  const [isDragging, setIsDragging] = useState<boolean | undefined>(undefined)
  const [knobPosition, setKnobPosition] = useState(NaN)

  useEffect(() => {
    updateRect()
  }, [rootRef, orientation])

  useEffect(() => {
    initInteractivity()
    updateKnobPosition()

    return () => {
      deinitInteractivity()
    }
  }, [rect])

  useEffect(() => {
    snapToClosestBreakpointIfNeeded()
  }, [autoSnap])

  return (
    <StyledRoot ref={rootRef} id={id} className={className} orientation={orientation} style={style}>
      <StyledGutter orientation={orientation} css={startingGutterCSS} style={orientation === 'vertical' ? { top: 0, height: `${getStartingGutterLength()}px` } : { left: 0, width: `${getStartingGutterLength()}px` }}/>
      <StyledKnob
        ref={knobRef}
        className={classNames({
          'at-end': isInverted ? (position.current === 0) : (position.current === 1),
          'at-start': isInverted ? (position.current === 1) : (position.current === 0),
          'dragging': isDragging === true,
          'idle': isDragging === false,
        })}
        css={knobCSS}
        style={{
          height: `${knobHeight}px`,
          position: 'absolute',
          width: `${knobWidth}px`,
          zIndex: 1,
          ...(orientation === 'vertical' ? {
            margin: `${-knobHeight / 2 + knobPosition}px 0 0 ${((rect?.width ?? 0) - knobWidth) / 2}px`,
          } : {
            margin: `${((rect?.height ?? 0) - knobHeight) / 2}px 0 0 ${-knobWidth / 2 + knobPosition}px`,
          }),
          ...!!rect ? {} : {
            visibility: 'hidden',
          },
        }}
      >
        {breakpoints && isLabelVisible && labelProvider && (
          <StyledLabel knobHeight={knobHeight} css={labelCSS}>{labelProvider(getPosition(), getClosestIndex())}</StyledLabel>
        )}
      </StyledKnob>
      <StyledGutter orientation={orientation} css={endingGutterCSS} style={orientation === 'vertical' ? { bottom: 0, height: `${getEndingGutterLength()}px` } : { right: 0, width: `${getEndingGutterLength()}px` }}/>
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
`

const StyledLabel = styled.label<LabelCSSProps>`
  color: #000;
  font-size: ${props => props.knobHeight * .5}px;
  pointer-events: none;
  user-select: none;
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
