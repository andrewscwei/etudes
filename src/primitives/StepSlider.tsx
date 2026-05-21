import clsx from 'clsx'
import { type HTMLAttributes, type MouseEvent, type Ref, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Rect } from 'spase'

import { useInertiaDrag } from '../hooks/useInertiaDrag.js'
import { useRect } from '../hooks/useRect.js'
import { asClassNameDict } from '../utils/asClassNameDict.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { createKey } from '../utils/createKey.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

/**
 * A "step" slider component supporting both horizontal and vertical
 * orientations that automatically whose knob snaps to a set of predefined
 * points on the track upon drag release. These points are referred to as
 * "steps", indexed by an integer referred to as "index". The index is
 * controlled via the `index` prop; feed the value reported by `onIndexChange`
 * back into it to persist changes. While the width and height of the slider is
 * inferred from its CSS rules, the width and height of the knob are set via
 * props (`knobWidth` and `knobHeight`, respectively). The size of the knob does
 * not impact the size of the slider. While dragging, the slider still emits a
 * position change event, where the position is a decimal ranging between 0.0
 * and 1.0, inclusive.
 *
 * @exports StepSlider.Knob Component for the knob.
 * @exports StepSlider.KnobContainer Component for the container of the knob.
 * @exports StepSlider.Label Component for the label on the knob.
 * @exports StepSlider.Track Component for the slide track on either side of the
 *                           knob.
 */
export function StepSlider({
  className,
  ref,
  children,
  index = 0,
  knobHeight = 30,
  knobPadding = 0,
  knobWidth = 30,
  orientation = 'vertical',
  steps = _generateSteps(10),
  trackPadding = 0,
  isClipped = false,
  isInverted = false,
  isTrackInteractive = true,
  formatLabel: labelProvider,
  onDragEnd,
  onDragStart,
  onIndexChange,
  onPositionChange,
  ...props
}: StepSlider.Props) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const knobContainerRef = useRef<HTMLButtonElement>(null)
  const startTrackRef = useRef<HTMLDivElement>(null)
  const endTrackRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef(_getPositionAt(index, steps))
  const indexRef = useRef(index)

  const bodyRect = useRect(bodyRef)

  const [isDragging, setIsDragging] = useState(false)
  const [isReleasing, setIsReleasing] = useState(false)

  // The position the knob rests at for the controlled `index`. Used for the
  // label, the at-start/at-end flags and as the drag accumulator's base.
  const position = _getPositionAt(index, steps)

  const withDraggedValue = useCallback((pos: number, dx: number, dy: number) => {
    const vPos = _mapValuePositionToVisualPosition(pos, isInverted)

    switch (orientation) {
      case 'horizontal': {
        const maxWidth = isClipped ? bodyRect.width - knobWidth : bodyRect.width
        const newX = vPos * maxWidth + dx
        const newVPos = _clamped(newX / maxWidth)

        return _mapVisualPositionToValuePosition(newVPos, isInverted)
      }
      case 'vertical': {
        const maxHeight = isClipped ? bodyRect.height - knobHeight : bodyRect.height
        const newY = vPos * maxHeight + dy
        const newVPos = _clamped(newY / maxHeight)

        return _mapVisualPositionToValuePosition(newVPos, isInverted)
      }
      default:
        console.error(`[etudes::StepSlider] Invalid orientation: ${orientation}`)

        return NaN
    }
  }, [bodyRect.width, bodyRect.height, isClipped, isInverted, knobWidth, knobHeight, orientation])

  const applyPosition = useCallback((pos: number) => {
    const vPos = _mapValuePositionToVisualPosition(pos, isInverted)
    const knob = knobContainerRef.current
    const startTrack = startTrackRef.current
    const endTrack = endTrackRef.current
    const computeTrackOffset = (size: number) => `${trackPadding <= 0 ? 0 : size * 0.5}px - ${trackPadding}px`

    switch (orientation) {
      case 'horizontal':
        if (knob) knob.style.left = isClipped ? `calc(${vPos * 100}% + ${knobWidth * 0.5 - vPos * knobWidth}px)` : `${vPos * 100}%`
        if (startTrack) startTrack.style.width = `calc(${vPos * 100}% - ${computeTrackOffset(knobWidth)})`
        if (endTrack) endTrack.style.width = `calc(${(1 - vPos) * 100}% - ${computeTrackOffset(knobWidth)})`

        break
      case 'vertical':
        if (knob) knob.style.top = isClipped ? `calc(${vPos * 100}% + ${knobHeight * 0.5 - vPos * knobHeight}px)` : `${vPos * 100}%`
        if (startTrack) startTrack.style.height = `calc(${vPos * 100}% - ${computeTrackOffset(knobHeight)})`
        if (endTrack) endTrack.style.height = `calc(${(1 - vPos) * 100}% - ${computeTrackOffset(knobHeight)})`

        break
      default:
        break
    }
  }, [isClipped, isInverted, knobHeight, knobWidth, orientation, trackPadding])

  const suppressTransitions = useCallback((suppressed: boolean) => {
    const value = suppressed ? 'none' : ''

    for (const el of [knobContainerRef.current, startTrackRef.current, endTrackRef.current]) {
      if (el) el.style.transition = value
    }
  }, [])

  const trackClickHandler = useCallback((event: MouseEvent) => {
    if (!isTrackInteractive) return

    const vrect = Rect.fromViewport()
    let newPos: number

    switch (orientation) {
      case 'horizontal': {
        const newVPos = (event.clientX + vrect.left - bodyRect.left) / bodyRect.width
        newPos = _mapVisualPositionToValuePosition(newVPos, isInverted)
        break
      }
      case 'vertical': {
        const newVPos = (event.clientY + vrect.top - bodyRect.top) / bodyRect.height
        newPos = _mapVisualPositionToValuePosition(newVPos, isInverted)

        break
      }
      default:
        console.error(`[etudes::StepSlider] Invalid orientation: ${orientation}`)

        return
    }

    const nearestIndex = _getNearestIndexByPosition(newPos, steps)
    const newIndex = nearestIndex === indexRef.current
      ? _clamped(newPos > positionRef.current ? nearestIndex + 1 : nearestIndex - 1, steps.length - 1)
      : nearestIndex
    const hasChanged = newIndex !== indexRef.current

    if (hasChanged) {
      const newPosition = _getPositionAt(newIndex, steps)
      indexRef.current = newIndex
      positionRef.current = newPosition

      applyPosition(newPosition)

      onPositionChange?.(newPosition, false)
      onIndexChange?.(newIndex, false)
    }
  }, [bodyRect.width, bodyRect.left, bodyRect.top, bodyRect.height, isInverted, isTrackInteractive, orientation, applyPosition, createKey(steps)])

  useInertiaDrag(knobContainerRef, {
    onDragEnd: () => {
      suppressTransitions(false)

      setIsDragging(false)
      setIsReleasing(true)

      const nearestIndex = _getNearestIndexByPosition(positionRef.current, steps)
      const nearestPosition = _getPositionAt(nearestIndex, steps)
      positionRef.current = nearestPosition
      indexRef.current = nearestIndex

      onPositionChange?.(nearestPosition, false)
      onIndexChange?.(nearestIndex, false)
      onDragEnd?.()
    },
    onDragMove: ({ x, y }) => {
      const newPosition = withDraggedValue(positionRef.current, x, y)
      const hasChanged = newPosition !== positionRef.current

      if (hasChanged) {
        positionRef.current = newPosition
        applyPosition(newPosition)
        onPositionChange?.(newPosition, true)

        const nearestIndex = _getNearestIndexByPosition(newPosition, steps)

        if (nearestIndex !== indexRef.current) {
          indexRef.current = nearestIndex
          onIndexChange?.(nearestIndex, true)
        }
      }

      setIsDragging(true)
      setIsReleasing(false)
    },
    onDragStart: () => {
      suppressTransitions(true)

      setIsDragging(true)
      setIsReleasing(false)

      onDragStart?.()
    },
  })

  useLayoutEffect(() => {
    if (isDragging) return

    const target = _getPositionAt(index, steps)
    indexRef.current = index
    positionRef.current = target

    applyPosition(target)
  }, [index, isDragging, applyPosition, createKey(steps)])

  const isAtEnd = isInverted ? position === 0 : position === 1
  const isAtStart = isInverted ? position === 1 : position === 0
  const fixedClassNames = useMemo(() => _getFixedClassNames({ orientation, isAtEnd, isAtStart, isDragging, isReleasing }), [orientation, isAtEnd, isAtStart, isDragging, isReleasing])
  const fixedStyles = useMemo(() => _getFixedStyles({ knobHeight, knobPadding, knobWidth, orientation, isTrackInteractive }), [knobHeight, knobPadding, knobWidth, orientation, isTrackInteractive])
  const components = asComponentDict(children, {
    knob: StepSlider.Knob,
    knobContainer: StepSlider.KnobContainer,
    label: StepSlider.Label,
    track: StepSlider.Track,
  })

  return (
    <div
      {...props}
      className={clsx(className, fixedClassNames.root)}
      ref={ref}
      aria-valuenow={index}
      role='slider'
    >
      <div ref={bodyRef} style={fixedStyles.body}>
        <Styled
          className={fixedClassNames.track}
          ref={startTrackRef}
          style={styles(fixedStyles.track, orientation === 'vertical' ? { top: '0' } : { left: '0' })}
          data-position={isInverted ? 'end' : 'start'}
          element={components.track ?? <StepSlider.Track/>}
          onClick={trackClickHandler}
        >
          <div style={fixedStyles.trackHitBox}/>
        </Styled>
        <Styled
          className={fixedClassNames.track}
          ref={endTrackRef}
          style={styles(fixedStyles.track, orientation === 'vertical' ? { bottom: '0' } : { right: '0' })}
          data-position={isInverted ? 'start' : 'end'}
          element={components.track ?? <StepSlider.Track/>}
          onClick={trackClickHandler}
        >
          <div style={fixedStyles.trackHitBox}/>
        </Styled>
        <Styled
          className={fixedClassNames.knobContainer}
          ref={knobContainerRef}
          style={styles(fixedStyles.knobContainer)}
          element={components.knobContainer ?? <StepSlider.KnobContainer/>}
        >
          <Styled
            className={fixedClassNames.knob}
            style={styles(fixedStyles.knob)}
            element={components.knob ?? <StepSlider.Knob/>}
          >
            <div style={fixedStyles.knobHitBox}/>
            {labelProvider && (
              <Styled
                className={fixedClassNames.label}
                style={styles(fixedStyles.label)}
                element={components.label ?? <StepSlider.Label/>}
              >
                {labelProvider(position, index)}
              </Styled>
            )}
          </Styled>
        </Styled>
      </div>
    </div>
  )
}

export namespace StepSlider {
  /**
   * Type describing the orientation of {@link StepSlider}.
   */
  export type Orientation = 'horizontal' | 'vertical'

  /**
   * Type describing the props of {@link StepSlider}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLDivElement>

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
     * StepSliderOrientation of the slider.
     */
    orientation?: Orientation

    /**
     * An array of step descriptors. A step is a position (0 - 1 inclusive) on
     * the track where the knob should snap to if dragging stops near it. Ensure
     * that there are at least two steps: one for the start of the track and one
     * for the end.
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
    formatLabel?: (position: number, index: number) => string

    /**
     * Handler invoked when dragging ends.
     */
    onDragEnd?: () => void

    /**
     * Handler invoked when dragging begins.
     */
    onDragStart?: () => void

    /**
     * Handler invoked when the nearest step index changes due to dragging or a
     * track click. While dragging it is invoked with `isDragging` set to
     * `true`; on release (after snapping) and on a track click it is invoked
     * with `isDragging` set to `false`. Emitted right after `onPositionChange`.
     *
     * @param index The current slider index.
     * @param isDragging Specifies if the change is from an in-progress drag.
     */
    onIndexChange?: (index: number, isDragging: boolean) => void

    /**
     * Handler invoked when the continuous position changes due to dragging or a
     * track click. While dragging it is invoked with `isDragging` set to
     * `true`; on release (after snapping) and on a track click it is invoked
     * with `isDragging` set to `false`. Emitted right before `onIndexChange`.
     *
     * @param position The current slider position.
     * @param isDragging Specifies if the change is from an in-progress drag.
     */
    onPositionChange?: (position: number, isDragging: boolean) => void
  } & Omit<HTMLAttributes<HTMLDivElement>, 'aria-valuenow' | 'onChange' | 'role'>

  /**
   * Component for the knob of a {@link StepSlider}.
   */
  export const Knob = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}/>
  )

  /**
   * Component for the container of the knob of a {@link StepSlider}.
   */
  export const KnobContainer = ({ ...props }: HTMLAttributes<HTMLButtonElement>) => (
    <button {...props}/>
  )

  /**
   * Component for the label on the knob of a {@link StepSlider}.
   */
  export const Label = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}/>
  )

  /**
   * Component for the track of a {@link StepSlider}.
   */
  export const Track = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}/>
  )

  /**
   * Generates a set of steps compatible with this component.
   *
   * @param length The number of steps. This must be at least 2 because you must
   *               include the starting and ending points.
   *
   * @returns An array of steps.
   */
  export const generateSteps = _generateSteps
}

function _generateSteps(length: number): readonly number[] {
  if (length <= 1) {
    console.error('[etudes::StepSlider] `length` value must be greater than or equal to 2')

    return []
  }

  if (Math.round(length) !== length) {
    console.error('[etudes::StepSlider] `length` value must be an integer')

    return []
  }

  const interval = 1 / (length - 1)

  return Array(length).fill(null).map((_, i) => {
    const position = interval * i

    return position
  })
}

function _getNearestIndexByPosition(position: number, steps: readonly number[]): number {
  let index = -1
  let minDelta = NaN

  for (let i = 0, n = steps.length; i < n; i++) {
    const step = _getPositionAt(i, steps)

    if (isNaN(step)) continue

    const delta = Math.abs(position - step)

    if (isNaN(minDelta) || delta < minDelta) {
      minDelta = delta
      index = i
    }
  }

  return index
}

function _getPositionAt(index: number, steps: readonly number[]): number {
  if (index >= steps.length) return NaN

  return steps[index]
}

function _mapVisualPositionToValuePosition(vPos: number, isInverted: boolean): number {
  return isInverted ? 1 - vPos : vPos
}

function _mapValuePositionToVisualPosition(pos: number, isInverted: boolean): number {
  return isInverted ? 1 - pos : pos
}

function _clamped(value: number, max: number = 1, min: number = 0): number {
  return Math.max(min, Math.min(max, value))
}

function _getFixedClassNames({ orientation = 'vertical', isAtEnd = false, isAtStart = false, isDragging = false, isReleasing = false }) {
  return asClassNameDict({
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
  })
}

function _getFixedStyles({ knobHeight = 0, knobPadding = 0, knobWidth = 0, orientation = 'vertical', isTrackInteractive = false }) {
  return asStyleDict({
    body: {
      height: '100%',
      width: '100%',
    },
    knob: {
      height: `${knobHeight}px`,
      touchAction: 'none',
      width: `${knobWidth}px`,
    },
    knobContainer: {
      background: 'none',
      border: 'none',
      outline: 'none',
      position: 'absolute',
      transform: 'translate3d(-50%, -50%, 0)',
      zIndex: '1',
      ...orientation === 'vertical' ? { left: '50%' } : { top: '50%' },
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
      transform: orientation === 'horizontal' ? 'translate3d(0, -50%, 0)' : 'translate3d(-50%, 0, 0)',
      width: '100%',
    },
  })
}

if (process.env.NODE_ENV === 'development') {
  StepSlider.displayName = 'StepSlider'
  StepSlider.Track.displayName = 'StepSlider.Track'
  StepSlider.Knob.displayName = 'StepSlider.Knob'
  StepSlider.KnobContainer.displayName = 'StepSlider.KnobContainer'
  StepSlider.Label.displayName = 'StepSlider.Label'
}
