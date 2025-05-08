import clsx from 'clsx'
import { forwardRef, useCallback, useEffect, useRef, useState, type HTMLAttributes, type MouseEvent } from 'react'
import { Rect } from 'spase'
import { useDragValue } from '../hooks/useDragValue.js'
import { useRect } from '../hooks/useRect.js'
import { asClassNameDict } from '../utils/asClassNameDict.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { cloneStyledElement } from '../utils/cloneStyledElement.js'
import { createKey } from '../utils/createKey.js'
import { styles } from '../utils/styles.js'

/**
 * Type describing the orientation of {@link StepSlider}.
 */
export type StepSliderOrientation = 'horizontal' | 'vertical'

/**
 * Type describing the props of {@link StepSlider}.
 */
export type StepSliderProps = Omit<HTMLAttributes<HTMLDivElement>, 'aria-valuenow' | 'role'> & {
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
   * Indicates if position/index change events are dispatched only when dragging
   * ends. When disabled, aforementioned events are fired repeatedly while
   * dragging.
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
   * StepSliderOrientation of the slider.
   */
  orientation?: StepSliderOrientation

  /**
   * An array of step descriptors. A step is a position (0 - 1 inclusive) on the
   * track where the knob should snap to if dragging stops near it. Ensure that
   * there are at least two steps: one for the start of the track and one for
   * the end.
   */
  steps?: readonly number[]

  /**
   * The current index.
   */
  index?: number

  /**
   * A function that returns the label to be displayed at a given slider
   * position and closest step index (if steps are provided).
   *
   * @param position The current slider position.
   * @param index The nearest step index (if steps are provided), or -1 if no
   *                steps are provided.
   *
   * @returns The label.
   */
  labelProvider?: (position: number, index: number) => string

  /**
   * Handler invoked when index changes. This can either be invoked from the
   * `index` prop being changed or from the slider being dragged. Note that if
   * the event is emitted at the end of dragging due to
   * `onlyDispatchesOnDragEnd` set to `true`, the `isDragging` parameter here is
   * still `true`. This event is emitted right after `onPositionChange`.
   *
   * @param index The current slider index.
   * @param isDragging Specifies if the index change is due to dragging.
   */
  onIndexChange?: (index: number, isDragging: boolean) => void

  /**
   * Handler invoked when position changes. This can either be invoked from the
   * `index` prop being changed or from the slider being dragged. Note that if
   * the event is emitted at the end of dragging due to
   * `onlyDispatchesOnDragEnd` set to `true`, the `isDragging` parameter here is
   * still `true`. This event is emitted right before `onIndexChange`.
   *
   * @param position The current slider position.
   * @param isDragging Specifies if the position change is due to dragging.
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
 * A "step" slider component supporting both horizontal and vertical
 * orientations that automatically snaps to a set of predefined points on the
 * slider when dragged. These points are referred to as "steps", indexed by an
 * integer referred to as "index". This index can be two-way bound. The
 * component consists of four customizable elements: a draggable knob, a label
 * on the knob, a scroll track before the knob and a scroll track after the
 * knob. While the width and height of the slider is inferred from its CSS
 * rules, the width and height of the knob are set via props (`knobWidth` and
 * `knobHeight`, respectively). The size of the knob does not impact the size of
 * the slider. While dragging, the slider still emits a position change event,
 * where the position is a decimal ranging between 0.0 and 1.0, inclusive.
 *
 * @exports StepSliderKnob Component for the knob.
 * @exports StepSliderLabel Component for the label on the knob.
 * @exports StepSliderTrack Component for the slide track on either side of the
 *                          knob.
 */
export const StepSlider = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<StepSliderProps>>(({
  children,
  className,
  index: externalIndex = 0,
  isClipped = false,
  isInverted = false,
  isTrackInteractive = true,
  knobHeight = 30,
  knobWidth = 30,
  labelProvider,
  onlyDispatchesOnDragEnd = false,
  orientation = 'vertical',
  steps = generateSteps(10),
  trackPadding = 0,
  onDragEnd,
  onDragStart,
  onIndexChange,
  onPositionChange,
  ...props
}, ref) => {
  const bodyRef = useRef<HTMLDivElement>(null)
  const knobContainerRef = useRef<HTMLButtonElement>(null)
  const rect = useRect(bodyRef)
  const [index, setIndex] = useState(externalIndex)

  const mapDragValueToPosition = useCallback((value: number, dx: number, dy: number) => {
    const truePosition = isInverted ? inverted(value) : value

    switch (orientation) {
      case 'horizontal': {
        const maxWidth = isClipped ? rect.width - knobWidth : rect.width
        const trueNewPositionX = truePosition * maxWidth + dx
        const trueNewPosition = clamped(trueNewPositionX / maxWidth)
        const normalizedPosition = isInverted ? inverted(trueNewPosition) : trueNewPosition

        return normalizedPosition
      }
      case 'vertical': {
        const maxHeight = isClipped ? rect.height - knobHeight : rect.height
        const trueNewPositionY = truePosition * maxHeight + dy
        const trueNewPosition = clamped(trueNewPositionY / maxHeight)
        const normalizedPosition = isInverted ? inverted(trueNewPosition) : trueNewPosition

        return normalizedPosition
      }
      default:
        throw Error(`Invalid orientation: ${orientation}`)
    }
  }, [rect.width, rect.height, isClipped, isInverted, knobWidth, knobHeight, orientation])

  const { isDragging, isReleasing, value: position, setValue: setPosition } = useDragValue(knobContainerRef, {
    initialValue: getPositionAt(externalIndex, steps),
    transform: mapDragValueToPosition,
    onDragStart,
    onDragEnd,
  })

  const trackClickHandler = useCallback((event: MouseEvent) => {
    if (!isTrackInteractive) return

    const vrect = Rect.fromViewport()

    switch (orientation) {
      case 'horizontal': {
        const trackPosition = (event.clientX + vrect.left - rect.left) / rect.width
        const normalizedPosition = isInverted ? inverted(trackPosition) : trackPosition
        const nearestIndex = getNearestIndexByPosition(normalizedPosition, steps)

        if (nearestIndex === index) {
          const newIndex = normalizedPosition > position ? nearestIndex + 1 : nearestIndex - 1
          setIndex(clamped(newIndex, steps.length - 1))
        }
        else {
          setIndex(nearestIndex)
        }

        break
      }
      case 'vertical': {
        const trackPosition = (event.clientY + vrect.top - rect.top) / rect.height
        const normalizedPosition = isInverted ? inverted(trackPosition) : trackPosition
        const nearestIndex = getNearestIndexByPosition(normalizedPosition, steps)

        if (nearestIndex === index) {
          const newIndex = normalizedPosition > position ? nearestIndex + 1 : nearestIndex - 1
          const newPosition = getPositionAt(newIndex, steps)
          setPosition(newPosition)
          setIndex(clamped(newIndex, steps.length - 1))
        }
        else {
          const newPosition = getPositionAt(nearestIndex, steps)
          setPosition(newPosition)
          setIndex(nearestIndex)
        }

        break
      }
      default:
        throw Error(`Invalid orientation: ${orientation}`)
    }
  }, [rect.width, rect.height, position, isInverted, isTrackInteractive, orientation, createKey(steps)])

  // Natural position is the position affecting internal components accounting
  // for `isInverted`.
  const naturalPosition = isInverted ? inverted(position) : position
  const isAtEnd = isInverted ? position === 0 : position === 1
  const isAtStart = isInverted ? position === 1 : position === 0
  const fixedClassNames = getFixedClassNames({ orientation, isAtEnd, isAtStart, isDragging, isReleasing })
  const fixedStyles = getFixedStyles({ orientation, naturalPosition, isClipped, isDragging, knobHeight, knobWidth, isTrackInteractive })
  const components = asComponentDict(children, {
    knob: StepSliderKnob,
    label: StepSliderLabel,
    track: StepSliderTrack,
  })

  useEffect(() => {
    if (isDragging) return

    setPosition(getPositionAt(externalIndex, steps))
    setIndex(externalIndex)
  }, [externalIndex, isDragging, createKey(steps)])

  useEffect(() => {
    if (isDragging) {
      if (onlyDispatchesOnDragEnd) return

      setIndex(getNearestIndexByPosition(position, steps))
    }
    else {
      const nearestIndex = getNearestIndexByPosition(position, steps)
      const nearestPosition = getPositionAt(nearestIndex, steps)

      setPosition(nearestPosition)
      setIndex(nearestIndex)
    }
  }, [position, isDragging, onlyDispatchesOnDragEnd, createKey(steps)])

  useEffect(() => {
    onPositionChange?.(position, isDragging)
  }, [position, isDragging])

  useEffect(() => {
    onIndexChange?.(index, isDragging)
  }, [index, isDragging])

  return (
    <div
      {...props}
      ref={ref}
      aria-valuenow={index}
      className={clsx(className, fixedClassNames.root)}
      role='slider'
    >
      <div ref={bodyRef} style={fixedStyles.body}>
        {cloneStyledElement(components.track ?? <StepSliderTrack/>, {
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
        {cloneStyledElement(components.track ?? <StepSliderTrack/>, {
          className: clsx(isInverted ? 'start' : 'end', fixedClassNames.track),
          style: styles(fixedStyles.track, orientation === 'vertical' ? {
            bottom: '0',
            height: `calc(${(inverted(naturalPosition)) * 100}% - ${trackPadding <= 0 ? 0 : knobHeight * 0.5}px - ${trackPadding}px)`,
          } : {
            right: '0',
            width: `calc(${(inverted(naturalPosition)) * 100}% - ${trackPadding <= 0 ? 0 : knobWidth * 0.5}px - ${trackPadding}px)`,
          }),
          onClick: trackClickHandler,
        }, <div style={fixedStyles.trackHitBox}/>)}
        <button ref={knobContainerRef} style={fixedStyles.knobContainer}>
          {cloneStyledElement(components.knob ?? <StepSliderKnob/>, {
            className: clsx(fixedClassNames.knob),
            style: styles(fixedStyles.knob),
          }, steps && labelProvider && cloneStyledElement(components.label ?? <StepSliderLabel/>, {
            className: clsx(fixedClassNames.label),
            style: styles(fixedStyles.label),
          }, labelProvider(position, getNearestIndexByPosition(position, steps))))}
        </button>
      </div>
    </div>
  )
})

/**
 * Component for the knob of a {@link StepSlider}.
 */
export const StepSliderKnob = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

/**
 * Component for the label on the knob of a {@link StepSlider}.
 */
export const StepSliderLabel = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

/**
 * Component for the track of a {@link StepSlider}.
 */
export const StepSliderTrack = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

/**
 * Generates a set of steps compatible with this component.
 *
 * @param length The number of steps. This must be at least 2 because you must
 *                 include the starting and ending points.
 *
 * @returns An array of steps.
 */
export function generateSteps(length: number): readonly number[] {
  if (length <= 1) throw new Error('`length` value must be greater than or equal to 2')
  if (Math.round(length) !== length) throw new Error('`length` value must be an integer')

  const interval = 1 / (length - 1)

  return Array(length).fill(null).map((_, i) => {
    const position = interval * i

    return position
  })
}

function getNearestIndexByPosition(position: number, steps: readonly number[]): number {
  let index = -1
  let minDelta = NaN

  for (let i = 0, n = steps.length; i < n; i++) {
    const step = getPositionAt(i, steps)

    if (isNaN(step)) continue

    const delta = Math.abs(position - step)

    if (isNaN(minDelta) || delta < minDelta) {
      minDelta = delta
      index = i
    }
  }

  return index
}

function getPositionAt(index: number, steps: readonly number[]): number {
  if (index >= steps.length) return NaN

  return steps[index]
}

function getFixedClassNames({ orientation = 'vertical', isAtEnd = false, isAtStart = false, isDragging = false, isReleasing = false }) {
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
    label: clsx(orientation, {
      'at-end': isAtEnd,
      'at-start': isAtStart,
      'dragging': isDragging,
      'releasing': isReleasing,
    }),
  })
}

function getFixedStyles({ orientation = 'vertical', naturalPosition = 0, isClipped = false, isDragging = false, knobHeight = 0, knobWidth = 0, isTrackInteractive = false }) {
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
      transform: 'translate3d(-50%, -50%, 0)',
      zIndex: '1',
      ...orientation === 'vertical' ? {
        left: '50%',
        top: isClipped ? `calc(${naturalPosition * 100}% + ${knobHeight * 0.5 - naturalPosition * knobHeight}px)` : `${naturalPosition * 100}%`,
        transition: isDragging === false ? 'top 100ms ease-out' : 'none',
      } : {
        left: isClipped ? `calc(${naturalPosition * 100}% + ${knobWidth * 0.5 - naturalPosition * knobWidth}px)` : `${naturalPosition * 100}%`,
        top: '50%',
        transition: isDragging === false ? 'left 100ms ease-out' : 'none',
      },
    },
    knob: {
      height: `${knobHeight}px`,
      touchAction: 'none',
      width: `${knobWidth}px`,
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
      transform: orientation === 'horizontal' ? 'translate3d(0, -50%, 0)' : 'translate3d(-50%, 0, 0)',
      width: '100%',
    },
  })
}

function inverted(value: number): number {
  return 1 - value
}

function clamped(value: number, max: number = 1, min: number = 0): number {
  return Math.max(min, Math.min(max, value))
}

if (process.env.NODE_ENV !== 'production') {
  StepSlider.displayName = 'StepSlider'
  StepSliderTrack.displayName = 'StepSliderTrack'
  StepSliderKnob.displayName = 'StepSliderKnob'
  StepSliderLabel.displayName = 'StepSliderLabel'
}
