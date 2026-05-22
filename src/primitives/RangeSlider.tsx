import isDeepEqual from 'fast-deep-equal/react'
import { type HTMLAttributes, type Ref, type RefObject, useCallback, useLayoutEffect, useMemo, useRef } from 'react'

import { useInertiaDrag } from '../hooks/useInertiaDrag.js'
import { useSize } from '../hooks/useSize.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { Styled } from '../utils/Styled.js'
import { styles } from '../utils/styles.js'

/**
 * A slider component that allows the user to select a range of values.
 *
 * @exports RangeSlider.Knob Component for the knob.
 * @exports RangeSlider.KnobContainer Component for the container of the knob.
 * @exports RangeSlider.Label Component for the label.
 * @exports RangeSlider.Track Component for the track.
 * @exports RangeSlider.TrackHighlight Component for the track highlight.
 */
export function RangeSlider({
  ref,
  children,
  knobHeight = 28,
  knobPadding = 0,
  knobWidth = 40,
  max: maxValue,
  min: minValue,
  orientation = 'vertical',
  range = [minValue, maxValue],
  steps = -1,
  isClipped = false,
  formatLabel,
  onChange,
  onDragEnd,
  onDragStart,
  ...props
}: RangeSlider.Props) {
  const rootRef = ref as RefObject<HTMLDivElement> ?? useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const startKnobContainerRef = useRef<HTMLDivElement>(null)
  const endKnobContainerRef = useRef<HTMLDivElement>(null)
  const trackHighlightRef = useRef<HTMLDivElement>(null)
  const isDraggingStartKnobRef = useRef(false)
  const isDraggingEndKnobRef = useRef(false)

  const [startValue, endValue] = range
  const startValueRef = useRef(startValue)
  const endValueRef = useRef(endValue)

  const bodySize = useSize(bodyRef)

  const breakpoints = useMemo(() => _createBreakpoints(minValue, maxValue, steps), [minValue, maxValue, steps])
  const components = asComponentDict(children, {
    knob: RangeSlider.Knob,
    knobContainer: RangeSlider.KnobContainer,
    label: RangeSlider.Label,
    track: RangeSlider.Track,
    trackHighlight: RangeSlider.TrackHighlight,
  })

  const withDraggedStartValue = useCallback((value: number, dx: number, dy: number) => {
    const delta = orientation === 'horizontal' ? dx : dy
    const dMin = _getDisplacementByValue(minValue, minValue, maxValue, orientation, bodySize.width, bodySize.height, knobWidth, knobHeight, isClipped)
    const dMax = _getDisplacementByValue(endValueRef.current, minValue, maxValue, orientation, bodySize.width, bodySize.height, knobWidth, knobHeight, isClipped)
    const dCurr = _getDisplacementByValue(value, minValue, maxValue, orientation, bodySize.width, bodySize.height, knobWidth, knobHeight, isClipped) + delta

    return _getValueByDisplacement(_clamped(dCurr, dMax, dMin), minValue, maxValue, orientation, bodySize.width, bodySize.height, knobWidth, knobHeight, isClipped)
  }, [knobWidth, knobHeight, isClipped, minValue, maxValue, orientation, bodySize.width, bodySize.height])

  const withDraggedEndValue = useCallback((value: number, dx: number, dy: number) => {
    const delta = orientation === 'horizontal' ? dx : dy
    const dMin = _getDisplacementByValue(startValueRef.current, minValue, maxValue, orientation, bodySize.width, bodySize.height, knobWidth, knobHeight, isClipped)
    const dMax = _getDisplacementByValue(maxValue, minValue, maxValue, orientation, bodySize.width, bodySize.height, knobWidth, knobHeight, isClipped)
    const dCurr = _getDisplacementByValue(value, minValue, maxValue, orientation, bodySize.width, bodySize.height, knobWidth, knobHeight, isClipped) + delta

    return _getValueByDisplacement(_clamped(dCurr, dMax, dMin), minValue, maxValue, orientation, bodySize.width, bodySize.height, knobWidth, knobHeight, isClipped)
  }, [knobWidth, knobHeight, isClipped, minValue, maxValue, orientation, bodySize.width, bodySize.height])

  const applyKnobs = useCallback(() => {
    const startDisplacement = _getDisplacementByValue(startValueRef.current, minValue, maxValue, orientation, bodySize.width, bodySize.height, knobWidth, knobHeight, isClipped)
    const endDisplacement = _getDisplacementByValue(endValueRef.current, minValue, maxValue, orientation, bodySize.width, bodySize.height, knobWidth, knobHeight, isClipped)
    const startKnob = startKnobContainerRef.current
    const endKnob = endKnobContainerRef.current
    const trackHighlight = trackHighlightRef.current

    if (orientation === 'horizontal') {
      if (startKnob) startKnob.style.left = `${startDisplacement}px`
      if (endKnob) endKnob.style.left = `${endDisplacement}px`
      if (trackHighlight) {
        trackHighlight.style.transform = `translate(${startDisplacement}px, 0)`
        trackHighlight.style.width = `${endDisplacement - startDisplacement}px`
      }
    } else {
      if (startKnob) startKnob.style.top = `${startDisplacement}px`
      if (endKnob) endKnob.style.top = `${endDisplacement}px`
      if (trackHighlight) {
        trackHighlight.style.transform = `translate(0, ${startDisplacement}px)`
        trackHighlight.style.height = `${endDisplacement - startDisplacement}px`
      }
    }
  }, [isClipped, knobHeight, knobWidth, maxValue, minValue, orientation, bodySize.width, bodySize.height])

  const suppressTransitions = useCallback((knob: HTMLElement | null, suppressed: boolean) => {
    const value = suppressed ? 'none' : ''

    for (const el of [knob, trackHighlightRef.current]) {
      if (el) el.style.transition = value
    }
  }, [])

  useInertiaDrag(startKnobContainerRef, {
    onDragEnd: () => {
      suppressTransitions(startKnobContainerRef.current, false)

      const snapped = breakpoints ? _getClosestSteppedValue(startValueRef.current, breakpoints) : startValueRef.current
      startValueRef.current = snapped

      isDraggingStartKnobRef.current = false
      rootRef.current?.classList.remove('dragging')
      startKnobContainerRef.current?.classList.remove('dragging')
      endKnobContainerRef.current?.classList.remove('dragging')

      onChange?.([snapped, endValueRef.current], false)
      onDragEnd?.()
    },
    onDragMove: ({ x, y }) => {
      const newValue = withDraggedStartValue(startValueRef.current, x, y)
      const hasChanged = newValue !== startValueRef.current

      if (hasChanged) {
        startValueRef.current = newValue
        applyKnobs()
        onChange?.([newValue, endValueRef.current], true)
      }

      isDraggingStartKnobRef.current = true
      rootRef.current?.classList.add('dragging')
      startKnobContainerRef.current?.classList.add('dragging')
      endKnobContainerRef.current?.classList.remove('dragging')
    },
    onDragStart: () => {
      suppressTransitions(startKnobContainerRef.current, true)

      isDraggingStartKnobRef.current = true
      rootRef.current?.classList.add('dragging')
      startKnobContainerRef.current?.classList.add('dragging')
      endKnobContainerRef.current?.classList.remove('dragging')

      onDragStart?.()
    },
  })

  useInertiaDrag(endKnobContainerRef, {
    onDragEnd: () => {
      suppressTransitions(endKnobContainerRef.current, false)

      const snapped = breakpoints ? _getClosestSteppedValue(endValueRef.current, breakpoints) : endValueRef.current
      endValueRef.current = snapped

      isDraggingEndKnobRef.current = false
      rootRef.current?.classList.remove('dragging')
      startKnobContainerRef.current?.classList.remove('dragging')
      endKnobContainerRef.current?.classList.remove('dragging')

      onChange?.([startValueRef.current, snapped], false)
      onDragEnd?.()
    },
    onDragMove: ({ x, y }) => {
      const newValue = withDraggedEndValue(endValueRef.current, x, y)
      const hasChanged = newValue !== endValueRef.current

      if (hasChanged) {
        endValueRef.current = newValue
        applyKnobs()
        onChange?.([startValueRef.current, newValue], true)
      }

      isDraggingEndKnobRef.current = true
      rootRef.current?.classList.add('dragging')
      startKnobContainerRef.current?.classList.remove('dragging')
      endKnobContainerRef.current?.classList.add('dragging')
    },
    onDragStart: () => {
      suppressTransitions(endKnobContainerRef.current, true)

      isDraggingEndKnobRef.current = true
      rootRef.current?.classList.add('dragging')
      startKnobContainerRef.current?.classList.remove('dragging')
      endKnobContainerRef.current?.classList.add('dragging')

      onDragStart?.()
    },
  })

  useLayoutEffect(() => {
    if (isDraggingStartKnobRef.current || isDraggingEndKnobRef.current) return

    startValueRef.current = startValue
    endValueRef.current = endValue

    applyKnobs()
  }, [startValue, endValue, applyKnobs])

  const fixedStyles = useMemo(() => _getFixedStyles({ knobHeight, knobPadding, knobWidth, orientation }), [knobHeight, knobPadding, knobWidth, orientation])

  return (
    <div
      {...props}
      ref={rootRef}
      aria-orientation={orientation}
      aria-valuemax={maxValue}
      aria-valuemin={minValue}
      data-orientation={orientation}
      role='slider'
    >
      <div
        ref={bodyRef}
        style={fixedStyles.body}
      >
        <Styled
          style={styles(fixedStyles.track)}
          element={components.track ?? <RangeSlider.Track/>}
        />
        <Styled
          ref={trackHighlightRef}
          style={styles(fixedStyles.trackHighlight)}
          element={components.trackHighlight ?? <RangeSlider.TrackHighlight/>}
        />
        <Styled
          ref={startKnobContainerRef}
          style={styles(fixedStyles.knobContainer, {
            pointerEvents: isDeepEqual([startValue, endValue], [minValue, minValue]) ? 'none' : 'auto',
          }, orientation === 'horizontal' ? {
            top: '50%',
          } : {
            left: '50%',
          })}
          disabled={isDeepEqual([startValue, endValue], [minValue, minValue])}
          element={components.knobContainer ?? <RangeSlider.KnobContainer/>}
        >
          <Styled
            style={styles(fixedStyles.knob)}
            element={components.knob ?? <RangeSlider.Knob/>}
          >
            <div style={fixedStyles.knobHitBox}/>
            {components.label && formatLabel && (
              <Styled
                style={styles(fixedStyles.label)}
                element={components.label ?? <RangeSlider.Label/>}
              >
                {formatLabel(startValue, 'start')}
              </Styled>
            )}
          </Styled>
        </Styled>
        <Styled
          ref={endKnobContainerRef}
          style={styles(fixedStyles.knobContainer, {
            pointerEvents: isDeepEqual([startValue, endValue], [maxValue, maxValue]) ? 'none' : 'auto',
          }, orientation === 'horizontal' ? {
            top: '50%',
          } : {
            left: '50%',
          })}
          disabled={isDeepEqual([startValue, endValue], [maxValue, maxValue])}
          element={components.knobContainer ?? <RangeSlider.KnobContainer/>}
        >
          <Styled
            style={styles(fixedStyles.knob)}
            element={components.knob ?? <RangeSlider.Knob/>}
          >
            <div style={fixedStyles.knobHitBox}/>
            {components.label && formatLabel && (
              <Styled
                style={styles(fixedStyles.label)}
                element={components.label ?? <RangeSlider.Label/>}
              >
                {formatLabel(endValue, 'end')}
              </Styled>
            )}
          </Styled>
        </Styled>
      </div>
    </div>
  )
}

export namespace RangeSlider {
  /**
   * Type describing the orientation of {@link RangeSlider}.
   */
  export type Orientation = 'horizontal' | 'vertical'

  /**
   * Type describing the range of values of {@link RangeSlider}.
   */
  export type Range = [number, number]

  /**
   * Type describing the props of {@link RangeSlider}.
   */
  export type Props = {
    /**
     * Reference to the root element.
     */
    ref?: Ref<HTMLDivElement>

    /**
     * Specifies if the knobs are clipped to the track.
     */
    isClipped?: boolean

    /**
     * Height of the knobs in pixels.
     */
    knobHeight?: number

    /**
     * Invisible padding around the knobs in pixels, helps expand their hit
     * boxes.
     */
    knobPadding?: number

    /**
     * Width of the knobs in pixels.
     */
    knobWidth?: number

    /**
     * Maximum value to clamp to.
     */
    max: number

    /**
     * Minimum value to clamp to.
     */
    min: number

    /**
     * Orientation of the slider.
     */
    orientation?: Orientation

    /**
     * Range of values.
     */
    range?: Range

    /**
     * Number of intervals between the minimum and maximum values to snap to
     * when either knob releases. If set to `-1`, the knobs will not snap to any
     * value.
     */
    steps?: number

    /**
     * A function that formats the labels displayed on the knobs based on the
     * selected values. If not provided, no label will be rendered.
     *
     * @param value The value of the side specified by `side`.
     * @param side Specifies which side the label is for, either the 'start' or
     *             'end' knob.
     *
     * @returns The formatted string.
     */
    formatLabel?: (value: number, side: 'end' | 'start') => string

    /**
     * Handler invoked when the range of values changes due to dragging a knob.
     * While dragging it is invoked repeatedly with `isDragging` set to `true`;
     * when a knob is released it is invoked once more with the stepped range and
     * `isDragging` set to `false`.
     *
     * @param range The current range of values.
     * @param isDragging Specifies if the change is from an in-progress drag.
     */
    onChange?: (range: Range, isDragging: boolean) => void

    /**
     * Handler invoked when dragging a knob ends.
     */
    onDragEnd?: () => void

    /**
     * Handler invoked when dragging a knob begins.
     */
    onDragStart?: () => void
  } & Omit<HTMLAttributes<HTMLDivElement>, 'aria-valuemax' | 'aria-valuemin' | 'onChange' | 'role'>

  /**
   * Component for the track of a {@link RangeSlider}.
   */
  export const Track = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}/>
  )

  /**
   * Component for the track highlight of a {@link RangeSlider}.
   */
  export const TrackHighlight = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}/>
  )

  /**
   * Component for the knob of a {@link RangeSlider}.
   */
  export const Knob = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}/>
  )

  /**
   * Component for the container of the knob of a {@link RangeSlider}.
   */
  export const KnobContainer = ({ ...props }: HTMLAttributes<HTMLButtonElement>) => (
    <button {...props}/>
  )

  /**
   * Component for the label of a {@link RangeSlider}.
   */
  export const Label = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
    <div {...props}/>
  )
}

function _getFixedStyles({ knobHeight = 0, knobPadding = 0, knobWidth = 0, orientation = 'horizontal' }) {
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
      transform: 'translate(-50%, -50%)',
      zIndex: '1',
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
      position: 'relative',
      userSelect: 'none',
    },
    track: {
      display: 'block',
      height: '100%',
      left: '0',
      position: 'absolute',
      top: '0',
      width: '100%',
    },
    trackHighlight: {
      left: '0',
      position: 'absolute',
      top: '0',
      ...orientation === 'horizontal' ? { height: '100%' } : { width: '100%' },
    },
  })
}

function _getPositionByValue(value: number, min: number, max: number) {
  return (value - min) / (max - min)
}

function _getPositionByDisplacement(displacement: number, orientation: RangeSlider.Orientation, bodyWidth: number, bodyHeight: number, knobWidth: number, knobHeight: number, isClipped: boolean) {
  switch (orientation) {
    case 'horizontal': {
      const maxWidth = isClipped ? bodyWidth - knobWidth : bodyWidth
      if (maxWidth <= 0) return 0

      return (displacement - (isClipped ? knobWidth * 0.5 : 0)) / maxWidth
    }
    case 'vertical': {
      const maxHeight = isClipped ? bodyHeight - knobHeight : bodyHeight
      if (maxHeight <= 0) return 0

      return (displacement - (isClipped ? knobHeight * 0.5 : 0)) / maxHeight
    }
    default:
      console.error(`[etudes::RangeSlider] Invalid orientation: ${orientation}`)

      return NaN
  }
}

function _getValueByPosition(position: number, min: number, max: number) {
  return position * (max - min) + min
}

function _getValueByDisplacement(displacement: number, min: number, max: number, orientation: RangeSlider.Orientation, bodyWidth: number, bodyHeight: number, knobWidth: number, knobHeight: number, isClipped: boolean) {
  const position = _getPositionByDisplacement(displacement, orientation, bodyWidth, bodyHeight, knobWidth, knobHeight, isClipped)

  return _getValueByPosition(position, min, max)
}

function _getDisplacementByPosition(position: number, orientation: RangeSlider.Orientation, bodyWidth: number, bodyHeight: number, knobWidth: number, knobHeight: number, isClipped: boolean) {
  switch (orientation) {
    case 'horizontal': {
      const maxWidth = isClipped ? bodyWidth - knobWidth : bodyWidth

      return position * maxWidth + (isClipped ? knobWidth * 0.5 : 0)
    }
    case 'vertical': {
      const maxHeight = isClipped ? bodyHeight - knobHeight : bodyHeight

      return position * maxHeight + (isClipped ? knobHeight * 0.5 : 0)
    }
    default:
      console.error(`[etudes::RangeSlider] Invalid orientation: ${orientation}`)

      return NaN
  }
}

function _getDisplacementByValue(value: number, min: number, max: number, orientation: RangeSlider.Orientation, bodyWidth: number, bodyHeight: number, knobWidth: number, knobHeight: number, isClipped: boolean) {
  const position = _getPositionByValue(value, min, max)

  return _getDisplacementByPosition(position, orientation, bodyWidth, bodyHeight, knobWidth, knobHeight, isClipped)
}

function _getClosestSteppedValue(value: number, breakpoints: number[]) {
  const n = breakpoints.length
  let idx = 0
  let diff = Infinity

  for (let i = 0; i < n; i++) {
    const t = breakpoints[i]
    const d = Math.abs(value - t)

    if (d < diff) {
      diff = d
      idx = i
    }
  }

  return breakpoints[idx]
}

function _createBreakpoints(min: number, max: number, steps: number): number[] | undefined {
  if (steps < 0) return undefined

  return [
    min,
    ...[...Array(steps)].map((_, i) => min + (i + 1) * (max - min) / (1 + steps)),
    max,
  ]
}

function _clamped(value: number, max: number, min: number): number {
  return Math.max(min, Math.min(max, value))
}

if (process.env.NODE_ENV === 'development') {
  RangeSlider.displayName = 'RangeSlider'
  RangeSlider.Knob.displayName = 'RangeSlider.Knob'
  RangeSlider.Label.displayName = 'RangeSlider.Label'
  RangeSlider.Track.displayName = 'RangeSlider.Track'
  RangeSlider.TrackHighlight.displayName = 'RangeSlider.TrackHighlight'
}
