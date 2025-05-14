import clsx from 'clsx'
import { forwardRef, useCallback, useEffect, useRef, type HTMLAttributes, type MouseEvent } from 'react'
import { Rect } from 'spase'
import { useInertiaDragValue } from '../hooks/useInertiaDragValue.js'
import { asClassNameDict } from '../utils/asClassNameDict.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { cloneStyledElement } from '../utils/cloneStyledElement.js'
import { styles } from '../utils/styles.js'

/**
 * Type describing the orientation of {@link Slider}.
 */
export type SliderOrientation = 'horizontal' | 'vertical'

/**
 * Type describing the props of {@link Slider}.
 */
export type SliderProps = Omit<HTMLAttributes<HTMLDivElement>, 'aria-orientation' | 'aria-valuenow' | 'role' | 'onChange'> & {
  /**
   * Specifies if the knob is clipped to the track.
   */
  isClipped?: boolean

  /**
   * By default the position is a value from 0 - 1, 0 being the start of the
   * slider and 1 being the end. Switching on this flag inverts this behavior,
   * where 0 becomes the end of the slider and 1 being the start.
   */
  isInverted?: boolean

  /**
   * Specifies if the track is clickable to set the position of the knob.
   */
  isTrackInteractive?: boolean

  /**
   * Indicates if position change events are dispatched only when dragging ends.
   * When disabled, aforementioned events are fired repeatedly while dragging.
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
   * Invisible padding around the knob in pixels, helps expand its hit box.
   */
  knobPadding?: number

  /**
   * Width of the knob in pixels.
   */
  knobWidth?: number

  /**
   * Orientation of the slider.
   */
  orientation?: SliderOrientation

  /**
   * The current position.
   */
  position?: number

  /**
   * A function that returns the label to be displayed at a given slider
   * position.
   *
   * @param position The current slider position.
   *
   * @returns The label.
   */
  labelProvider?: (position: number) => string

  /**
   * Handler invoked when position changes. This can either be invoked from the
   * `position` prop being changed or from the slider being dragged. Note that
   * if the event is emitted at the end of dragging due to
   * `onlyDispatchesOnDragEnd` set to `true`, the `isDragging` parameter here is
   * still `true`.
   *
   * @param position The current slider position.
   * @param isDragging Specifies if the position change is due to dragging.
   */
  onChange?: (position: number, isDragging: boolean) => void

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
 * A slider component supporting both horizontal and vertical orientations whose
 * sliding position (a decimal between 0.0 and 1.0, inclusive) can be two-way
 * bound. The component consists of three customizable elements: a draggable
 * knob, a label on the knob, and a scroll track on either side of the knob.
 * While the width and height of the slider is inferred from its CSS rules, the
 * width and height of the knob are set via props (`knobWidth` and `knobHeight`,
 * respectively). The size of the knob does not impact the size of the slider.
 *
 * @exports SliderKnob Component for the knob.
 * @exports SliderKnobContainer Component for the container of the knob.
 * @exports SliderLabel Component for the label on the knob.
 * @exports SliderTrack Component for the slide track on either side of the
 *                      knob.
 */
export const Slider = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<SliderProps>>(({
  children,
  className,
  isClipped = false,
  isInverted = false,
  isTrackInteractive = true,
  knobHeight = 30,
  knobPadding = 0,
  knobWidth = 30,
  onlyDispatchesOnDragEnd = false,
  orientation = 'vertical',
  position: externalPosition = 0,
  trackPadding = 0,
  labelProvider,
  onDragEnd,
  onDragStart,
  onChange,
  ...props
}, ref) => {
  const bodyRef = useRef<HTMLDivElement>(null)
  const knobContainerRef = useRef<HTMLButtonElement>(null)

  const mapDragValueToPosition = useCallback((value: number, dx: number, dy: number) => {
    const rect = Rect.from(bodyRef.current) ?? Rect.zero
    const truePosition = isInverted ? 1 - value : value

    switch (orientation) {
      case 'horizontal': {
        const maxWidth = isClipped ? rect.width - knobWidth : rect.width
        const trueNewPositionX = truePosition * maxWidth + dx
        const trueNewPosition = Math.max(0, Math.min(1, trueNewPositionX / maxWidth))
        const normalizedPosition = isInverted ? 1 - trueNewPosition : trueNewPosition

        return normalizedPosition
      }
      case 'vertical': {
        const maxHeight = isClipped ? rect.height - knobHeight : rect.height
        const trueNewPositionY = truePosition * maxHeight + dy
        const trueNewPosition = Math.max(0, Math.min(1, trueNewPositionY / maxHeight))
        const normalizedPosition = isInverted ? 1 - trueNewPosition : trueNewPosition

        return normalizedPosition
      }
      default:
        console.error(`[etudes::Slider] Invalid orientation: ${orientation}`)

        return NaN
    }
  }, [bodyRef.current, isClipped, isInverted, knobWidth, knobHeight, orientation])

  const trackClickHandler = useCallback((event: MouseEvent) => {
    if (!isTrackInteractive) return

    const rect = Rect.from(bodyRef.current) ?? Rect.zero
    const vrect = Rect.fromViewport()

    switch (orientation) {
      case 'horizontal': {
        const trackPosition = (event.clientX + vrect.left - rect.left) / rect.width
        const normalizedPosition = isInverted ? 1 - trackPosition : trackPosition
        setPosition(normalizedPosition)
        break
      }
      case 'vertical': {
        const trackPosition = (event.clientY + vrect.top - rect.top) / rect.height
        const normalizedPosition = isInverted ? 1 - trackPosition : trackPosition
        setPosition(normalizedPosition)
        break
      }
      default:
        console.error(`[etudes::Slider] Invalid orientation: ${orientation}`)
    }
  }, [bodyRef.current, isInverted, isTrackInteractive, orientation])

  const { isDragging, isReleasing, value: position, setValue: setPosition } = useInertiaDragValue(knobContainerRef, {
    initialValue: externalPosition,
    transform: mapDragValueToPosition,
    onDragStart,
    onDragEnd,
  })

  // Natural position is the position affecting internal components accounting
  // for `isInverted`.
  const naturalPosition = isInverted ? 1 - position : position
  const isAtEnd = isInverted ? position === 0 : position === 1
  const isAtStart = isInverted ? position === 1 : position === 0
  const fixedClassNames = _getFixedClassNames({ orientation, isAtEnd, isAtStart, isDragging, isReleasing })
  const fixedStyles = _getFixedStyles({ orientation, isClipped, naturalPosition, knobPadding, knobHeight, knobWidth, isTrackInteractive })

  useEffect(() => {
    if (isDragging || externalPosition === position) return
    setPosition(externalPosition)
  }, [externalPosition])

  useEffect(() => {
    if (isDragging && onlyDispatchesOnDragEnd) return
    onChange?.(position, isDragging)
  }, [position])

  useEffect(() => {
    if (isDragging || !onlyDispatchesOnDragEnd) return
    onChange?.(position, true)
  }, [isDragging])

  const components = asComponentDict(children, {
    knob: SliderKnob,
    knobContainer: SliderKnobContainer,
    label: SliderLabel,
    track: SliderTrack,
  })

  return (
    <div
      {...props}
      ref={ref}
      aria-orientation={orientation}
      aria-valuenow={position}
      className={clsx(className, fixedClassNames.root)}
      role='slider'
    >
      <div ref={bodyRef} style={fixedStyles.body}>
        {cloneStyledElement(components.track ?? <SliderTrack/>, {
          className: clsx(isInverted ? 'end' : 'start', fixedClassNames.track),
          style: styles(fixedStyles.track, orientation === 'vertical' ? {
            height: `calc(${naturalPosition * 100}% - ${trackPadding <= 0 ? 0 : knobHeight * 0.5}px - ${trackPadding}px)`,
            top: '0',
          } : {
            left: '0',
            width: `calc(${naturalPosition * 100}% - ${trackPadding <= 0 ? 0 : knobWidth * 0.5}px - ${trackPadding}px)`,
          }),
          onClick: trackClickHandler,
        }, <div style={fixedStyles.trackHitBox}/>)}

        {cloneStyledElement(components.track ?? <SliderTrack/>, {
          className: clsx(isInverted ? 'start' : 'end', fixedClassNames.track),
          style: styles(fixedStyles.track, orientation === 'vertical' ? {
            bottom: '0',
            height: `calc(${(1 - naturalPosition) * 100}% - ${trackPadding <= 0 ? 0 : knobHeight * 0.5}px - ${trackPadding}px)`,
          } : {
            right: '0',
            width: `calc(${(1 - naturalPosition) * 100}% - ${trackPadding <= 0 ? 0 : knobWidth * 0.5}px - ${trackPadding}px)`,
          }),
          onClick: trackClickHandler,
        }, <div style={fixedStyles.trackHitBox}/>)}

        {cloneStyledElement(components.knobContainer ?? <SliderKnobContainer/>, {
          className: clsx(fixedClassNames.knobContainer),
          style: fixedStyles.knobContainer,
          ref: knobContainerRef,
        }, cloneStyledElement(components.knob ?? <SliderKnob/>, {
          className: clsx(fixedClassNames.knob),
          style: styles(fixedStyles.knob),
        }, <div style={fixedStyles.knobHitBox}/>, labelProvider && cloneStyledElement(components.label ?? <SliderLabel/>, {
          className: clsx(fixedClassNames.label),
          style: styles(fixedStyles.label),
        }, labelProvider(position))))}
      </div>
    </div>
  )
})

/**
 * Component for the slide track on either side of the knob of a {@link Slider}.
 */
export const SliderTrack = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

/**
 * Component for the knob of a {@link Slider}.
 */
export const SliderKnob = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

/**
 * Component for the container of the knob of a {@link Slider}.
 */
export const SliderKnobContainer = ({ ...props }: HTMLAttributes<HTMLButtonElement>) => (
  <button {...props}/>
)

/**
 * Component for the label on the knob of a {@link Slider}.
 */
export const SliderLabel = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

function _getFixedClassNames({ orientation = 'vertical', isAtEnd = false, isAtStart = false, isDragging = false, isReleasing = false }) {
  return asClassNameDict({
    root: clsx(orientation, {
      'at-end': isAtEnd,
      'at-start': isAtStart,
      'dragging': isDragging,
      'releasing': isReleasing,
    }),
    track: clsx(orientation, {
      'at-end': isAtEnd,
      'at-start': isAtStart,
      'dragging': isDragging,
      'releasing': isReleasing,
    }),
    knob: clsx(orientation, {
      'at-end': isAtEnd,
      'at-start': isAtStart,
      'dragging': isDragging,
      'releasing': isReleasing,
    }),
    knobContainer: clsx(orientation, {
      'at-end': isAtEnd,
      'at-start': isAtStart,
      'dragging': isDragging,
      'releasing': isReleasing,
    }),
    label: clsx(orientation, {
      'at-end': isAtEnd,
      'at-start': isAtStart,
      'dragging': isDragging,
      'releasing': isReleasing,
    }),
  })
}

function _getFixedStyles({ orientation = 'vertical', isClipped = false, naturalPosition = 0, knobPadding = 0, knobHeight = 0, knobWidth = 0, isTrackInteractive = true }) {
  return asStyleDict({
    body: {
      height: '100%',
      width: '100%',
    },
    knobContainer: {
      background: 'none',
      border: 'none',
      outline: 'none',
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      zIndex: '1',
      ...orientation === 'vertical' ? {
        left: '50%',
        top: isClipped ? `calc(${naturalPosition * 100}% + ${knobHeight * 0.5 - naturalPosition * knobHeight}px)` : `${naturalPosition * 100}%`,
      } : {
        left: isClipped ? `calc(${naturalPosition * 100}% + ${knobWidth * 0.5 - naturalPosition * knobWidth}px)` : `${naturalPosition * 100}%`,
        top: '50%',
      },
    },
    knob: {
      height: `${knobHeight}px`,
      touchAction: 'none',
      width: `${knobWidth}px`,
    },
    knobHitBox: {
      background: 'none',
      height: `calc(100% + ${knobPadding * 2}px)`,
      left: `-${knobPadding}px`,
      padding: `${knobPadding}px`,
      position: 'absolute',
      top: `-${knobPadding}px`,
      width: `calc(100% + ${knobPadding * 2}px)`,
    },
    label: {
      pointerEvents: 'none',
      userSelect: 'none',
    },
    track: {
      cursor: isTrackInteractive ? 'pointer' : 'auto',
      pointerEvents: isTrackInteractive ? 'auto' : 'none',
      position: 'absolute',
      ...orientation === 'vertical' ? {
        left: '0',
        margin: '0 auto',
        right: '0',
        width: '100%',
      } : {
        bottom: '0',
        height: '100%',
        margin: 'auto 0',
        top: '0',
      },
    },
    trackHitBox: {
      height: '100%',
      minHeight: '20px',
      minWidth: '20px',
      position: 'absolute',
      transform: orientation === 'horizontal' ? 'translate(0, -50%)' : 'translate(-50%, 0)',
      width: '100%',
    },
  })
}

if (process.env.NODE_ENV !== 'production') {
  Slider.displayName = 'Slider'
  SliderTrack.displayName = 'SliderTrack'
  SliderKnob.displayName = 'SliderKnob'
  SliderKnobContainer.displayName = 'SliderKnobContainer'
  SliderLabel.displayName = 'SliderLabel'
}
