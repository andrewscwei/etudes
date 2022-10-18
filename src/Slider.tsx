import classNames from 'classnames'
import React, { HTMLAttributes, MouseEvent, useEffect, useRef } from 'react'
import { Rect } from 'spase'
import styled, { css } from 'styled-components'
import useDragEffect from './hooks/useDragEffect'

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:slider') : () => {}

export type Props = HTMLAttributes<HTMLDivElement> & {
  /**
   * By default the position is a value from 0 - 1, 0 being the start of the slider and 1 being the
   * end. Switching on this flag inverts this behavior, where 0 becomes the end of the slider and 1
   * being the start.
   */
  isInverted?: boolean

  /**
   * Specifies if the track is clickable to set the position of the knob.
   */
  isTrackInteractive?: boolean

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
  orientation?: 'horizontal' | 'vertical'

  /**
   * The current position.
   */
  position?: number

  /**
   * Handler invoked when position changes. This can either be invoked from the `position` prop
   * being changed or from the slider being dragged. Note that if the event is emitted at the end of
   * dragging due to `onlyDispatchesOnDragEnd` set to `true`, the `isDragging` parameter here is
   * still `true`.
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
}

/**
 * A slider component supporting both horizontal and vertical orientations whose sliding position (a
 * decimal between 0.0 and 1.0, inclusive) can be two-way binded. The component consists of four
 * customizable elements: a draggable knob, a label on the knob, a scroll track before the knob and
 * a scroll track after the knob. While the width and height of the slider is inferred from its CSS
 * rules, the width and height of the knob are set via props (`knobWidth` and `knobHeight`,
 * respectively). The size of the knob does not impact the size of the slider.
 *
 * @exports SliderKnob - The component for the knob.
 * @exports SliderKnobLabel - The component for the label on the knob.
 * @exports SliderStartingTrack - The component for the slide track before the knob.
 * @exports SliderEndingTrack - The component for the slide track after the knob.
 */
export default function Slider({
  isInverted = false,
  isTrackInteractive = true,
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
  ...props
}: Props) {
  const mapDragPositionToSliderPosition = (currentPosition: number, dx: number, dy: number): number => {
    const rect = Rect.from(rootRef.current) ?? new Rect()
    const naturalPosition = isInverted ? 1 - currentPosition : currentPosition
    const naturalNewPositionX = naturalPosition * rect.width + dx
    const naturalNewPositionY = naturalPosition * rect.height + dy
    const naturalNewPosition = orientation === 'vertical' ? Math.max(0, Math.min(1, naturalNewPositionY / rect.height)) : Math.max(0, Math.min(1, naturalNewPositionX / rect.width))
    const newPosition = isInverted ? 1 - naturalNewPosition : naturalNewPosition

    return newPosition
  }

  const onTrackClick = (event: MouseEvent) => {
    if (!isTrackInteractive) return

    const rect = Rect.from(rootRef.current) ?? new Rect()

    switch (orientation) {
      case 'horizontal': {
        const position = (event.clientX - rect.left) / rect.width
        const naturalPosition = isInverted ? 1 - position : position
        setPosition(naturalPosition)
        break
      }
      case 'vertical': {
        const position = (event.clientY - rect.top) / rect.height
        const naturalPosition = isInverted ? 1 - position : position
        setPosition(naturalPosition)
        break
      }
      default:
        break
    }
  }

  const rootRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLButtonElement>(null)

  const { isDragging: [isDragging], value: [position, setPosition] } = useDragEffect(knobRef, {
    initialValue: externalPosition,
    transform: mapDragPositionToSliderPosition,
    onDragStart,
    onDragEnd,
  })

  // Debug('Rendering...', 'OK')

  // Natural position is the position after taking `isInverted` into account.
  const naturalPosition = isInverted ? 1 - position : position

  useEffect(() => {
    if (isDragging || externalPosition === position) return

    debug('Updating drag effect value from position prop...', 'OK', `prop=${externalPosition}, effect=${position}`)

    setPosition(externalPosition)
  }, [externalPosition])

  useEffect(() => {
    if (isDragging && onlyDispatchesOnDragEnd) return
    onPositionChange?.(position, isDragging)
  }, [position])

  useEffect(() => {
    if (isDragging || !onlyDispatchesOnDragEnd) return
    onPositionChange?.(position, true)
  }, [isDragging])

  return (
    <StyledRoot {...props} ref={rootRef} orientation={orientation}>
      <SliderStartingTrack orientation={orientation} isClickable={isTrackInteractive} onClick={event => onTrackClick(event)}
        style={orientation === 'vertical' ? {
          top: 0,
          height: `calc(${naturalPosition * 100}% - ${trackPadding <= 0 ? 0 : knobHeight * 0.5}px - ${trackPadding}px)`,
        } : {
          left: 0,
          width: `calc(${naturalPosition * 100}% - ${trackPadding <= 0 ? 0 : knobWidth * 0.5}px - ${trackPadding}px)`,
        }}
      />
      <StyledKnobContainer ref={knobRef} style={{
        transform: 'translate3d(-50%, -50%, 0)',
        ...orientation === 'vertical' ? {
          left: '50%',
          top: `${naturalPosition * 100}%`,
          transition: isDragging === false ? 'top 100ms ease-out' : 'none',
        } : {
          left: `${naturalPosition * 100}%`,
          top: '50%',
          transition: isDragging === false ? 'left 100ms ease-out' : 'none',
        },
      }}>
        <SliderKnob
          className={classNames({
            'at-end': isInverted ? position === 0 : position === 1,
            'at-start': isInverted ? position === 1 : position === 0,
            'dragging': isDragging === true,
          })}
          style={{
            height: `${knobHeight}px`,
            width: `${knobWidth}px`,
          }}
        >
          {labelProvider && (
            <SliderKnobLabel knobHeight={knobHeight}>{labelProvider(position)}</SliderKnobLabel>
          )}
        </SliderKnob>
      </StyledKnobContainer>
      <SliderEndingTrack orientation={orientation} isClickable={isTrackInteractive} onClick={event => onTrackClick(event)}
        style={orientation === 'vertical' ? {
          bottom: 0,
          height: `calc(${(1 - naturalPosition) * 100}% - ${trackPadding <= 0 ? 0 : knobHeight * 0.5}px - ${trackPadding}px)`,
        } : {
          right: 0,
          width: `calc(${(1 - naturalPosition) * 100}% - ${trackPadding <= 0 ? 0 : knobWidth * 0.5}px - ${trackPadding}px)`,
        }}
      />
    </StyledRoot>
  )
}

export const SliderStartingTrack = styled.div<{
  orientation: NonNullable<Props['orientation']>
  isClickable: boolean
}>`
  background: #fff;
  cursor: ${props => props.isClickable ? 'pointer' : 'auto'};
  pointer-events: ${props => props.isClickable ? 'auto' : 'none'};
  position: absolute;
  transition-duration: 100ms;
  transition-property: background, color, opacity, transform;
  transition-timing-function: ease-out;

  &::after {
    content: '';
    height: 100%;
    min-height: 20px;
    min-width: 20px;
    position: absolute;
    transform: ${props => props.orientation === 'horizontal' ? 'translate3d(0, -50%, 0)' : 'translate3d(-50%, 0, 0)'};
    width: 100%;
  }

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

export const SliderEndingTrack = styled.div<{
  orientation: NonNullable<Props['orientation']>
  isClickable: boolean
}>`
  background: #fff;
  cursor: ${props => props.isClickable ? 'pointer' : 'auto'};
  pointer-events: ${props => props.isClickable ? 'auto' : 'none'};;
  position: absolute;
  transition-duration: 100ms;
  transition-property: background, color, opacity, transform;
  transition-timing-function: ease-out;

  &::after {
    content: '';
    height: 100%;
    min-height: 20px;
    min-width: 20px;
    position: absolute;
    transform: ${props => props.orientation === 'horizontal' ? 'translate3d(0, -50%, 0)' : 'translate3d(-50%, 0, 0)'};
    width: 100%;
  }

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

export const SliderKnob = styled.div`
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
`

export const SliderKnobLabel = styled.label<{ knobHeight: NonNullable<Props['knobHeight']> }>`
  color: #000;
  font-size: ${props => props.knobHeight * 0.5}px;
  pointer-events: none;
  user-select: none;
`

const StyledKnobContainer = styled.button`
  position: absolute;
  z-index: 1;
`

const StyledRoot = styled.div<{
  orientation: Props['orientation']
}>`
  box-sizing: border-box;
  display: block;
  height: ${props => props.orientation === 'vertical' ? '300px' : '4px'};
  position: relative;
  width: ${props => props.orientation === 'vertical' ? '4px' : '300px'};
`
