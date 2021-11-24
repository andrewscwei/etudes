import interact from 'interactjs'
import React, { createRef, CSSProperties, useEffect, useState } from 'react'
import { Rect } from 'spase'
import styled, { css } from 'styled-components'
import { ExtendedCSSFunction, ExtendedCSSProps, Orientation } from './types'

export type KnobCSSProps = Readonly<{
  isAtEnd: boolean
  isAtBeginning: boolean
  isDragging: boolean
  isReleasing: boolean
}>

export type GutterCSSProps = Readonly<{
  orientation: Orientation
}>

export type LabelCSSProps = Readonly<{
  knobHeight: number
}>

export interface BreakpointDescriptor {
  label?: string
  position?: number
}

export interface Props {
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
  style: CSSProperties

  /**
   * By default the position is a value from 0 - 1, 0 being the start of the slider and 1 being the
   * end. Switching on this flag inverts this behavior, where 0 becomes the end of the slider and 1
   * being the start.
   */
  isInverted: boolean

  /**
   * Indicates if position/index change events are dispatched only when dragging ends. When
   * disabled, aforementioned events are fired repeatedly while dragging.
   */
  onlyDispatchesOnDragEnd: boolean

  /**
   * Padding between the gutter and the knob in pixels.
   */
  gutterPadding: number

  /**
   * Height of the knob in pixels.
   */
  knobHeight: number

  /**
   * Width of the knob in pixels.
   */
  knobWidth: number

  /**
   * Orientation of the slider.
   */
  orientation: Orientation

  /**
   * The default position. This is ignored if `defaultIndex` and breakpoints are provided.
   */
  defaultPosition: number

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
   */
  onPositionChange?: (position: number) => void

  /**
   * Custom CSS provided to the gutter before the knob.
   */
  startingGutterCSS: ExtendedCSSFunction<GutterCSSProps>

  /**
   * Custom CSS provided to the gutter after the knob.
   */
  endingGutterCSS: ExtendedCSSFunction<GutterCSSProps>

  /**
   * Custom CSS provided to the knob.
   */
  knobCSS: ExtendedCSSFunction<KnobCSSProps>

  /**
   * Custom CSS provided to the label inside the knob.
   */
  labelCSS: ExtendedCSSFunction<LabelCSSProps>

  // The following props are only used if `breakpoints` are provided.

  /**
   * An array of breakpoint descriptors. A breakpoint is a position (0 - 1 inclusive) on the gutter
   * where the knob should snap to if dragging stops near it. You can associate a label with a
   * breakpoint so it can be displayed in the knob. If breakpoints are to be specified, ensure that
   * there are at least two: one for the start of the gutter and one for the end.
   */
  breakpoints?: readonly BreakpointDescriptor[]

  /**
   * Indicates whether the knob automatically snaps to the nearest breakpoint, if breakpoints are
   * provided.
   */
  autoSnap: boolean

  /**
   * Indicates if the breakpoint label is visible by the knob. Note that this is only applicable if
   * breakpoints are provided.
   */
  isLabelVisible: boolean

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
   */
  onIndexChange?: (index: number) => void
}

export interface State {
  /**
   * Indicates if the knob is being dragged.
   */
  isDragging: boolean

  /**
   * Indicates if the knob is being released.
   */
  isReleasing: boolean

  /**
   * Indicates the current position (0 - 1, inclusive) of the knob. 0 being the start of the slider,
   * 1 being the end.
   */
  position: number
}

/**
 * Generates a set of breakpoints compatible with this component.
 *
 * @param length - The number of breakpoints. This must be at least 2 because you must include the
 *                 starting and ending points.
 * @param labelIterator - Iterator function used for generating the label for each breakpoint.
 *
 * @returns An array of breakpoints.
 */
export function sliderBreakpointsFactory(length: number, labelIterator?: (index: number, position: number) => string): readonly BreakpointDescriptor[] {
  if (length <= 1) throw new Error('`length` value must be greater than or equal to 2')
  if (Math.round(length) !== length) throw new Error('`length` value must be an integer')

  const interval = 1 / (length - 1)

  return Array(length).fill(null).map((v, i) => {
    const pos = interval * i

    return {
      label: labelIterator?.(i, pos) ?? undefined,
      position: pos,
    }
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
  style = {},
  isInverted = false,
  onlyDispatchesOnDragEnd = false,
  gutterPadding = 0,
  knobHeight = 30,
  knobWidth = 30,
  orientation = 'vertical',
  defaultPosition = 0,
  onDragEnd,
  onDragStart,
  onPositionChange,
  startingGutterCSS = props => css``,
  endingGutterCSS = props => css``,
  knobCSS = props => css``,
  labelCSS = props => css``,
  breakpoints = sliderBreakpointsFactory(10, (index: number, position: number) => `${index}`),
  autoSnap = true,
  isLabelVisible = true,
  defaultIndex,
  onIndexChange,
}: Props) {
  /**
   * Computed rect of the root element.
   */
  function getRect(): Rect {
    return Rect.from(nodeRefs.root.current) ?? new Rect()
  }

  /**
   * Length of the gutter before the knob in pixels. If the orientation of the slider is horizontal,
   * this refers to the width, else this refers to the height.
   */
  function getStartingGutterLength(): number {
    console.log(rect, getRect())
    if (orientation === 'vertical') {
      return Math.max(0, (isInverted ? (1 - position) : position) * rect.height - (knobHeight / 2) - gutterPadding)
    }
    else {
      return Math.max(0, (isInverted ? (1 - position) : position) * rect.width - (knobWidth / 2) - gutterPadding)
    }
  }

  /**
   * Length of the gutter after the knob in pixels. If the orientation of the slider is horizontal,
   * this refers to the width, else this refers to the height.
   */
  function getEndingGutterLength(): number {
    if (orientation === 'vertical') {
      return Math.max(0, (isInverted ? position : (1 - position)) * rect.height - (knobHeight / 2) - gutterPadding)
    }
    else {
      return Math.max(0, (isInverted ? position : (1 - position)) * rect.width - (knobWidth / 2) - gutterPadding)
    }
  }

  /**
   * Position of the knob ranging from 0 to 1, inclusive. If for whatever reason the position cannot
   * be computed, NaN is returned.
   */
  function getKnobPosition(): number {
    const rootNode = nodeRefs.root.current

    if (!rootNode) return NaN

    const p = isInverted ? (1 - position) : position

    if (orientation === 'vertical') {
      return p * rect.height
    }
    else {
      return p * rect.width
    }
  }

  /**
   * Gets the index of the breakpoint of which the current position is closest to. If for whatever
   * reason the index cannot be computed (i.e. no breakpoints were provided), -1 is returned.
   */
  function getIndex(): number {
    if (!breakpoints) return -1

    let idx = 0
    let delta = NaN

    for (let i = 0, n = breakpoints.length; i < n; i++) {
      const breakpoint = getPositionByIndex(i)
      const d = Math.abs(position - breakpoint)

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
    return breakpoints[index].position ?? (index / (breakpoints.length - 1))
  }

  /**
   * Reconfigures input interactivity of the knob if needed.
   */
  function reconfigureInteractivityIfNeeded() {
    const knobNode = nodeRefs.knob.current

    if (knobNode) {
      if (!interact.isSet(knobNode)) {
        interact(knobNode).draggable({
          inertia: true,
          onstart: () => onKnobDragStart(),
          onmove: ({ dx, dy }) => onKnobDragMove(orientation === 'vertical' ? dy : dx),
          onend: () => onKnobDragStop(),
        })
      }
    }
  }

  /**
   * Handler invoked when the knob starts dragging.
   */
  function onKnobDragStart() {
    setIsDragging(true)
    setIsReleasing(false)
  }

  /**
   * Handler invoked when the knob moves.
   *
   * @param delta - The distance traveled (in pixels) since the last invocation of this handler.
   */
  function onKnobDragMove(delta: number) {
    const rect = getRect()
    const p = isInverted ? (1 - position) : position
    const x = p * rect.width + delta
    const y = p * rect.height + delta
    const t = (orientation === 'vertical') ? Math.max(0, Math.min(1, y / rect.height)) : Math.max(0, Math.min(1, x / rect.width))

    setIsDragging(true)
    setIsReleasing(false)
    setPosition(isInverted ? (1 - t) : t)
  }

  /**
   * Handler invoked when the knob stops dragging.
   */
  function onKnobDragStop() {
    setIsDragging(false)
    setIsReleasing(true)
    snapToClosestBreakpoint()
  }

  /**
   * Snaps the knob to the closest breakpoint. Note that if there are no breakpoints or
   * auto-snapping feature is disabled, this method does nothing.
   */
  function snapToClosestBreakpoint() {
    if (!autoSnap || !breakpoints) return

    const position = getPositionByIndex(getIndex())

    setPosition(position)
  }

  const nodeRefs = {
    root: createRef<HTMLDivElement>(),
    knob: createRef<HTMLDivElement>(),
  }

  const [isDragging, setIsDragging] = useState(false)
  const [isReleasing, setIsReleasing] = useState(false)
  const [position, setPosition] = useState(((breakpoints !== undefined) && (defaultIndex !== undefined)) ? getPositionByIndex(defaultIndex) : defaultPosition)
  const [value, setValue] = useState(0)
  const rect = getRect()
  const startingGutterLength = getStartingGutterLength()
  const endingGutterLength = getEndingGutterLength()
  const index = getIndex()
  const knobPosition = getKnobPosition()

  console.log(startingGutterLength, endingGutterLength)

  useEffect(() => {
    reconfigureInteractivityIfNeeded()
  })

  useEffect(() => {
    if (breakpoints) {
      if (autoSnap) {
        snapToClosestBreakpoint()
        onPositionChange?.(getPositionByIndex(index))
      }
      else {
        onPositionChange?.(position)
      }

      onIndexChange?.(index)
    }
    else {
      onPositionChange?.(position)
    }

    setValue(value + 1)
  }, [])

  useEffect(() => {
    if (onlyDispatchesOnDragEnd || !isDragging) return
    onPositionChange?.(position)
    if (breakpoints) onIndexChange?.(index)
  }, [position])

  useEffect(() => {
    if (isDragging) {
      onDragStart?.()
    }
    else {
      onPositionChange?.(position)
      if (breakpoints) onIndexChange?.(index)
      onDragEnd?.()
    }
  }, [isDragging])

  useEffect(() => {
    setValue(value + 1)
  }, [orientation])

  return (
    <StyledRoot
      id={id}
      className={className}
      ref={nodeRefs.root}
      orientation={orientation}
      style={style}
    >
      <StyledGutter
        orientation={orientation}
        style={orientation === 'vertical' ? {
          top: 0,
          height: `${startingGutterLength}px`,
        } : {
          left: 0,
          width: `${startingGutterLength}px`,
        }}
        extendedCSS={startingGutterCSS}
      />
      <StyledKnob
        isAtEnd={isInverted ? (position === 0) : (position === 1)}
        isAtBeginning={isInverted ? (position === 1) : (position === 0)}
        isDragging={isDragging}
        isReleasing={isReleasing}
        ref={nodeRefs.knob}
        extendedCSS={knobCSS}
        style={{
          height: `${knobHeight}px`,
          position: 'absolute',
          width: `${knobWidth}px`,
          zIndex: 1,
          ...(orientation === 'vertical' ? {
            margin: `${-knobHeight / 2 + knobPosition}px 0 0 ${(rect.width - knobWidth) / 2}px`,
          } : {
            margin: `${(rect.height - knobHeight) / 2}px 0 0 ${-knobWidth / 2 + knobPosition}px`,
          }),
        }}
      >
        {breakpoints && isLabelVisible && (
          <StyledLabel
            knobHeight={knobHeight}
            extendedCSS={labelCSS}
          >
            {breakpoints[index].label ?? ''}
          </StyledLabel>
        )}
      </StyledKnob>
      <StyledGutter
        orientation={orientation}
        style={orientation === 'vertical' ? {
          bottom: 0,
          height: `${endingGutterLength}px`,
        } : {
          right: 0,
          width: `${endingGutterLength}px`,
        }}
        extendedCSS={endingGutterCSS}
      />

    </StyledRoot>
  )
}

const StyledGutter = styled.div<GutterCSSProps & ExtendedCSSProps<GutterCSSProps>>`
  position: absolute;
  background: #fff;

  ${props => props.orientation === 'vertical' ? css`
    left: 0;
    right: 0;
    margin: 0 auto;
    width: 100%;
  ` : css`
    top: 0;
    bottom: 0;
    margin: auto 0;
    height: 100%;
  `}

  ${props => props.extendedCSS(props)}
`

const StyledLabel = styled.label<LabelCSSProps & ExtendedCSSProps<LabelCSSProps>>`
  font-size: ${props => props.knobHeight * .5}px;
  pointer-events: none;
  user-select: none;
  color: #000;
  ${props => props.extendedCSS(props)}
`

const StyledKnob = styled.div<KnobCSSProps & ExtendedCSSProps<KnobCSSProps>>`
  align-items: center;
  background: #fff;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: ${props => props.isDragging ? .6 : 1};
  touch-action: none;
  transition-duration: 100ms;
  transition-property: ${props => props.isReleasing ? 'background, color, opacity, margin, transform' : 'background, color, transform, opacity'};
  will-change: background, color, opacity, margin, transform;
  transition-timing-function: ease-out;
  ${props => props.extendedCSS(props)}
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
