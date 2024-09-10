import clsx from 'clsx'
import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type MouseEvent, type PropsWithChildren } from 'react'
import { Rect } from 'spase'
import { useDragValueEffect } from '../hooks/useDragValueEffect.js'
import { asClassNameDict, asComponentDict, asStyleDict, cloneStyledElement, styles } from '../utils/index.js'

type Orientation = 'horizontal' | 'vertical'

export type StepwiseSliderProps = HTMLAttributes<HTMLDivElement> & PropsWithChildren<{
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
   * Orientation of the slider.
   */
  orientation?: Orientation

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
   * Specifies if the component should use default styles.
   */
  usesDefaultStyles?: boolean

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
}>

/**
 * A "stepwise" slider component supporting both horizontal and vertical
 * orientations that automatically snaps to a set of predefined points on the
 * slider when dragged. These points are referred to as "steps", indexed by an
 * integer referred to as "index". This index can be two-way binded. The
 * component consists of four customizable elements: a draggable knob, a label
 * on the knob, a scroll track before the knob and a scroll track after the
 * knob. While the width and height of the slider is inferred from its CSS
 * rules, the width and height of the knob are set via props (`knobWidth` and
 * `knobHeight`, respectively). The size of the knob does not impact the size of
 * the slider. While dragging, the slider still emits a position change event,
 * where the position is a decimal ranging between 0.0 and 1.0, inclusive.
 *
 * @exports StepwiseSliderKnob The component for the knob.
 * @exports StepwiseSliderLabel The component for the label on the knob.
 * @exports StepwiseSliderTrack The component for the slide track on either side
 *                                of the knob.
 */
export const StepwiseSlider = forwardRef<HTMLDivElement, StepwiseSliderProps>(({
  children,
  className,
  index: externalIndex = 0,
  isInverted = false,
  isTrackInteractive = true,
  knobHeight = 30,
  knobWidth = 30,
  labelProvider,
  onlyDispatchesOnDragEnd = false,
  orientation = 'vertical',
  steps = generateSteps(10),
  trackPadding = 0,
  usesDefaultStyles = false,
  onDragEnd,
  onDragStart,
  onIndexChange,
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
  const [index, setIndex] = useState(externalIndex)

  const { isDragging: [isDragging], isReleasing: [isReleasing], value: [position, setPosition] } = useDragValueEffect(knobContainerRef, {
    initialValue: getPositionAt(externalIndex, steps),
    transform: mapDragValueToPosition,
    onDragStart,
    onDragEnd,
  }, [isInverted, orientation])

  // Natural position is the position affecting internal components accounting
  // for `isInverted`.
  const naturalPosition = isInverted ? 1 - position : position
  const isAtEnd = isInverted ? position === 0 : position === 1
  const isAtStart = isInverted ? position === 1 : position === 0
  const components = asComponentDict(children, {
    knob: StepwiseSliderKnob,
    label: StepwiseSliderLabel,
    track: StepwiseSliderTrack,
  })

  const fixedClassNames = getFixedClassNames({ orientation, isAtEnd, isAtStart, isDragging, isReleasing })
  const fixedStyles = getFixedStyles({ orientation, naturalPosition, isDragging, knobHeight, knobWidth, isTrackInteractive })
  const defaultStyles = usesDefaultStyles ? getDefaultStyles({ knobHeight }) : undefined

  useEffect(() => {
    if (isDragging) return

    const newPosition = getPositionAt(externalIndex, steps)

    if (position !== newPosition) {
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
    <div {...props} ref={ref} className={clsx(className, fixedClassNames.root)} data-component='stepwise-slider'>
      <div ref={bodyRef} style={fixedStyles.body}>
        {cloneStyledElement(components.track ?? <StepwiseSliderTrack style={defaultStyles?.track}/>, {
          className: clsx('start', fixedClassNames.track),
          style: styles(fixedStyles.track, orientation === 'vertical' ? {
            height: `calc(${naturalPosition * 100}% - ${trackPadding <= 0 ? 0 : knobHeight * 0.5}px - ${trackPadding}px)`,
            top: '0',
          } : {
            left: '0',
            width: `calc(${naturalPosition * 100}% - ${trackPadding <= 0 ? 0 : knobWidth * 0.5}px - ${trackPadding}px)`,
          }),
          onClick: trackClickHandler,
        }, <div style={fixedStyles.trackHitbox}/>)}
        {cloneStyledElement(components.track ?? <StepwiseSliderTrack style={defaultStyles?.track}/>, {
          className: clsx('end', fixedClassNames.track),
          style: styles(fixedStyles.track, orientation === 'vertical' ? {
            bottom: '0',
            height: `calc(${(1 - naturalPosition) * 100}% - ${trackPadding <= 0 ? 0 : knobHeight * 0.5}px - ${trackPadding}px)`,
          } : {
            right: '0',
            width: `calc(${(1 - naturalPosition) * 100}% - ${trackPadding <= 0 ? 0 : knobWidth * 0.5}px - ${trackPadding}px)`,
          }),
          onClick: trackClickHandler,
        }, <div style={fixedStyles.trackHitbox}/>)}
        <button ref={knobContainerRef} style={fixedStyles.knobContainer}>
          {cloneStyledElement(components.knob ?? <StepwiseSliderKnob style={defaultStyles?.knob}/>, {
            className: clsx(fixedClassNames.knob),
            style: styles(fixedStyles.knob),
          }, steps && labelProvider && cloneStyledElement(components.label ?? <StepwiseSliderLabel style={defaultStyles?.label}/>, {
            className: clsx(fixedClassNames.label),
            style: styles(fixedStyles.label),
          }, labelProvider(position, getNearestIndexByPosition(position, steps))))}
        </button>
      </div>
    </div>
  )
})

Object.defineProperty(StepwiseSlider, 'displayName', { value: 'StepwiseSlider', writable: false })

export const StepwiseSliderTrack = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props} data-child='track'/>

export const StepwiseSliderKnob = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props} data-child='knob'/>

export const StepwiseSliderLabel = ({ ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props} data-child='label'/>

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

  return Array(length).fill(null).map((v, i) => {
    const position = interval * i

    return position
  })
}

/**
 * Gets the index of the step of which the specified position is closest to. If
 * for whatever reason the index cannot be computed, -1 is returned.
 *
 * @param position The position (0 1, inclusive).
 * @param steps The steps.
 *
 * @returns The nearest index.
 */
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

/**
 * Gets the position by step index. This value ranges between 0 - 1, inclusive.
 *
 * @param index The step index.
 * @param steps The steps.
 *
 * @returns The position. If for whatever reason the position cannot be
 *          determined, `NaN` is returned.
 */
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

function getFixedStyles({ orientation = 'vertical', naturalPosition = 0, isDragging = false, knobHeight = 0, knobWidth = 0, isTrackInteractive = false }) {
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
        top: `${naturalPosition * 100}%`,
        transition: isDragging === false ? 'top 100ms ease-out' : 'none',
      } : {
        left: `${naturalPosition * 100}%`,
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
    trackHitbox: {
      height: '100%',
      minHeight: '20px',
      minWidth: '20px',
      position: 'absolute',
      transform: orientation === 'horizontal' ? 'translate3d(0, -50%, 0)' : 'translate3d(-50%, 0, 0)',
      width: '100%',
    },
  })
}

function getDefaultStyles({ knobHeight = 0 }) {
  return asStyleDict({
    knob: {
      alignItems: 'center',
      background: '#fff',
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'center',
    },
    label: {
      color: '#000',
      fontSize: '12px',
      lineHeight: `${knobHeight}px`,
    },
    track: {
      background: '#fff',
    },
  })
}
