import classNames from 'classnames'
import React, { CSSProperties, forwardRef, HTMLAttributes, MouseEvent, PropsWithChildren, useEffect, useRef } from 'react'
import { Rect } from 'spase'
import Each from './Each'
import useDragEffect from './hooks/useDragEffect'
import cloneStyledElement from './utils/cloneStyledElement'
import extractUniqueChildComponents from './utils/extractUniqueChildComponents'

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const debug = process.env.NODE_ENV === 'development' ? require('debug')('etudes:slider') : () => {}

export type SliderProps = HTMLAttributes<HTMLDivElement> & PropsWithChildren<{
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
   * A function that returns the label to be displayed at a given slider position.
   *
   * @param position - The current slider position.
   *
   * @returns The label.
   */
  labelProvider?: (position: number) => string

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
}>

/**
 * A slider component supporting both horizontal and vertical orientations whose sliding position (a
 * decimal between 0.0 and 1.0, inclusive) can be two-way binded. The component consists of three
 * customizable elements: a draggable knob, a label on the knob, and a scroll track on either side
 * of the knob. While the width and height of the slider is inferred from its CSS rules, the width
 * and height of the knob are set via props (`knobWidth` and `knobHeight`, respectively). The size
 * of the knob does not impact the size of the slider.
 *
 * @exports SliderKnob - The component for the knob.
 * @exports SliderKnobLabel - The component for the label on the knob.
 * @exports SliderTrack - The component for the slide track on either side of the knob.
 */
export default forwardRef<HTMLDivElement, SliderProps>(({
  children,
  className,
  isInverted = false,
  isTrackInteractive = true,
  knobHeight = 30,
  knobWidth = 30,
  labelProvider,
  onlyDispatchesOnDragEnd = false,
  orientation = 'vertical',
  position: externalPosition = 0,
  trackPadding = 0,
  onDragEnd,
  onDragStart,
  onPositionChange,
  ...props
}, ref) => {
  const mapDragValueToPosition = (value: number, dx: number, dy: number) => {
    const rect = Rect.from(bodyRef.current) ?? new Rect()
    const truePosition = isInverted ? 1 - value : value
    const trueNewPositionX = truePosition * rect.width + dx
    const trueNewPositionY = truePosition * rect.height + dy
    const trueNewPosition = orientation === 'vertical' ? Math.max(0, Math.min(1, trueNewPositionY / rect.height)) : Math.max(0, Math.min(1, trueNewPositionX / rect.width))
    const normalizedPosition = isInverted ? 1 - trueNewPosition : trueNewPosition

    return normalizedPosition
  }

  const trackClickHandler = (event: MouseEvent) => {
    if (!isTrackInteractive) return

    const rect = Rect.from(bodyRef.current) ?? new Rect()

    switch (orientation) {
      case 'horizontal': {
        const trackPosition = (event.clientX - rect.left) / rect.width
        const normalizedPosition = isInverted ? 1 - trackPosition : trackPosition
        setPosition(normalizedPosition)
        break
      }
      case 'vertical': {
        const trackPosition = (event.clientY - rect.top) / rect.height
        const normalizedPosition = isInverted ? 1 - trackPosition : trackPosition
        setPosition(normalizedPosition)
        break
      }
      default:
        break
    }
  }

  const bodyRef = useRef<HTMLDivElement>(null)
  const knobContainerRef = useRef<HTMLButtonElement>(null)

  const { isDragging: [isDragging], value: [position, setPosition] } = useDragEffect(knobContainerRef, {
    initialValue: externalPosition,
    transform: mapDragValueToPosition,
    onDragStart,
    onDragEnd,
  })

  // Natural position is the position affecting internal components accounting for `isInverted`.
  const naturalPosition = isInverted ? 1 - position : position

  const customComponents = extractUniqueChildComponents(children, {
    knob: SliderKnob,
    knobLabel: SliderKnobLabel,
    track: SliderTrack,
  })

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

  const bodyStyle: CSSProperties = {
    height: '100%',
    width: '100%',
  }

  const knobContainerStyle: CSSProperties = {
    position: 'absolute',
    transform: 'translate3d(-50%, -50%, 0)',
    zIndex: '1',
    ...orientation === 'vertical' ? {
      left: '50%',
      top: `${naturalPosition * 100}%`,
      transition: isDragging === false ? 'top 100ms ease-out' : 'none',
    } : {
      left: `${naturalPosition * 100}%`,
      top: '50%',
      transition: isDragging === false ? 'left 100ms ease-out' : 'none',
    },
  }

  const sliderTrackPaddingStyle: CSSProperties = {
    height: '100%',
    minHeight: '20px',
    minWidth: '20px',
    position: 'absolute',
    transform: orientation === 'horizontal' ? 'translate3d(0, -50%, 0)' : 'translate3d(-50%, 0, 0)',
    width: '100%',
  }

  const defaultSliderKnobStyle: CSSProperties = {
    background: '#fff',
    borderRadius: `${knobHeight * 0.5}px`,
  }

  const defaultSliderKnobLabelStyle: CSSProperties = {
    color: '#000',
    fontSize: '12px',
    lineHeight: `${knobHeight}px`,
  }

  const defaultSliderTrackStyle: CSSProperties = {
    background: '#fff',
  }

  return (
    <div {...props} className={classNames(className, orientation)} ref={ref}>
      <div ref={bodyRef} style={bodyStyle}>
        <Each in={['start', 'end']}>
          {align => cloneStyledElement(customComponents.track ?? <SliderTrack style={defaultSliderTrackStyle}/>, {
            className: align,
            style: {
              cursor: isTrackInteractive ? 'pointer' : 'auto',
              pointerEvents: isTrackInteractive ? 'auto' : 'none',
              position: 'absolute',
              ...orientation === 'vertical' ? {
                bottom: align === 'start' ? undefined : 0,
                height: align === 'start'
                  ? `calc(${naturalPosition * 100}% - ${trackPadding <= 0 ? 0 : knobHeight * 0.5}px - ${trackPadding}px)`
                  : `calc(${(1 - naturalPosition) * 100}% - ${trackPadding <= 0 ? 0 : knobHeight * 0.5}px - ${trackPadding}px)`,
                left: '0',
                margin: '0 auto',
                right: '0',
                top: align === 'start' ? 0 : undefined,
                width: '100%',
              } : {
                bottom: '0',
                height: '100%',
                left: align === 'start' ? 0 : undefined,
                margin: 'auto 0',
                right: align === 'start' ? undefined : 0,
                top: '0',
                width: align === 'start'
                  ? `calc(${naturalPosition * 100}% - ${trackPadding <= 0 ? 0 : knobWidth * 0.5}px - ${trackPadding}px)`
                  : `calc(${(1 - naturalPosition) * 100}% - ${trackPadding <= 0 ? 0 : knobWidth * 0.5}px - ${trackPadding}px)`,
              },
            },
            onClick: trackClickHandler,
          }, <div style={sliderTrackPaddingStyle}/>)}
        </Each>
        <button ref={knobContainerRef} style={knobContainerStyle}>
          {cloneStyledElement(customComponents.knob ?? <SliderKnob style={defaultSliderKnobStyle}/>, {
            className: classNames({
              [orientation]: true,
              'at-end': isInverted ? position === 0 : position === 1,
              'at-start': isInverted ? position === 1 : position === 0,
              'dragging': isDragging === true,
            }),
            style: {
              height: `${knobHeight}px`,
              touchAction: 'none',
              width: `${knobWidth}px`,
            },
          }, ...labelProvider ? [
            cloneStyledElement(customComponents.knobLabel ?? <SliderKnobLabel style={defaultSliderKnobLabelStyle}/>, {
              style: {
                pointerEvents: 'none',
                userSelect: 'none',
              },
            },
            labelProvider(position)),
          ] : [])}
        </button>
      </div>
    </div>
  )
})

export const SliderTrack = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}/>

export const SliderKnob = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}/>

export const SliderKnobLabel = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}/>

