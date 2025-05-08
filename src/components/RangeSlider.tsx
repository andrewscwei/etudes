import clsx from 'clsx'
import isDeepEqual from 'fast-deep-equal/react'
import { forwardRef, useCallback, useEffect, useRef, useState, type HTMLAttributes } from 'react'
import type { Rect } from 'spase'
import { useDragValue } from '../hooks/useDragValue.js'
import { useRect } from '../hooks/useRect.js'
import { asComponentDict } from '../utils/asComponentDict.js'
import { asStyleDict } from '../utils/asStyleDict.js'
import { cloneStyledElement } from '../utils/cloneStyledElement.js'
import { createKey } from '../utils/createKey.js'
import { styles } from '../utils/styles.js'

/**
 * Type describing the orientation of {@link RangeSlider}.
 */
export type RangeSliderOrientation = 'horizontal' | 'vertical'

/**
 * Type describing the range of values of {@link RangeSlider}.
 */
export type RangeSliderRange = [number, number]

/**
 * Type describing the props of {@link RangeSlider}.
 */
export type RangeSliderProps = Omit<HTMLAttributes<HTMLDivElement>, 'aria-valuemax' | 'aria-valuemin' | 'role'> & {
  /**
   * Number of decimal places to display.
   */
  decimalPlaces?: number

  /**
   * Specifies if the knobs are clipped to the track.
   */
  isClipped?: boolean

  /**
   * Height of the knobs in pixels.
   */
  knobHeight?: number

  /**
   * Invisible padding around the knobs in pixels, helps expand the their hit
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
  orientation?: RangeSliderOrientation

  /**
   * Range of values.
   */
  range?: RangeSliderRange

  /**
   * Number of intervals between the minimum and maximum values to snap to when
   * either knob releases. If set to `-1`, the knobs will not snap to any value.
   */
  steps?: number

  /**
   * Handler invoked when the range of values changes.
   *
   * @param range The current range of values.
   */
  onRangeChange?: (range: RangeSliderRange) => void
}

/**
 * A slider component that allows the user to select a range of values.
 *
 * @exports RangeSliderGutter Component for the gutter.
 * @exports RangeSliderHighlight Component for the highlight.
 * @exports RangeSliderKnob Component for the knob.
 * @exports RangeSliderKnobContainer Component for the container of the knob.
 * @exports RangeSliderLabel Component for the label.
 */
export const RangeSlider = /* #__PURE__ */ forwardRef<HTMLDivElement, Readonly<RangeSliderProps>>(({
  children,
  className,
  decimalPlaces = 2,
  isClipped = false,
  knobHeight = 28,
  knobPadding = 0,
  knobWidth = 40,
  max: maxValue,
  min: minValue,
  orientation = 'vertical',
  range: externalRange,
  steps = -1,
  onRangeChange,
  ...props
}, ref) => {
  const bodyRef = useRef<HTMLDivElement>(null)
  const bodyRect = useRect(bodyRef)
  const startKnobContainerRef = useRef<HTMLDivElement>(null)
  const endKnobContainerRef = useRef<HTMLDivElement>(null)
  const [range, setRange] = useState<RangeSliderRange>(externalRange ?? [minValue, maxValue])
  const breakpoints = createBreakpoints(minValue, maxValue, steps)
  const [start, end] = range.map(t => getDisplacementByValue(t, minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped))
  const highlightLength = end - start
  const components = asComponentDict(children, {
    gutter: RangeSliderGutter,
    highlight: RangeSliderHighlight,
    knob: RangeSliderKnob,
    knobContainer: RangeSliderKnobContainer,
    label: RangeSliderLabel,
  })

  const fixedStyles = getFixedStyles({ orientation, highlightLength, start, knobPadding, knobWidth, knobHeight })

  const mapStartDragValueToValue = useCallback((value: number, dx: number, dy: number) => {
    const delta = orientation === 'horizontal' ? dx : dy
    const dMin = getDisplacementByValue(minValue, minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped)
    const dMax = getDisplacementByValue(range[1], minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped)
    const dCurr = getDisplacementByValue(value, minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped) + delta

    return getValueByDisplacement(Math.max(dMin, Math.min(dMax, dCurr)), minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped)
  }, [knobWidth, knobHeight, isClipped, minValue, maxValue, orientation, range[1], createKey(bodyRect.toJSON())])

  const mapEndDragValueToValue = useCallback((value: number, dx: number, dy: number) => {
    const delta = orientation === 'horizontal' ? dx : dy
    const dMin = getDisplacementByValue(range[0], minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped)
    const dMax = getDisplacementByValue(maxValue, minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped)
    const dCurr = getDisplacementByValue(value, minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped) + delta

    return getValueByDisplacement(Math.max(dMin, Math.min(dMax, dCurr)), minValue, maxValue, orientation, bodyRect, knobWidth, knobHeight, isClipped)
  }, [knobWidth, knobHeight, isClipped, minValue, maxValue, orientation, range[0], createKey(bodyRect.toJSON())])

  const { isDragging: isDraggingStartKnob, isReleasing: isReleasingStartKnob, value: startValue, setValue: setStartValue } = useDragValue(startKnobContainerRef, {
    initialValue: externalRange?.[0] ?? minValue,
    transform: mapStartDragValueToValue,
  })

  const { isDragging: isDraggingEndKnob, isReleasing: isReleasingEndKnob, value: endValue, setValue: setEndValue } = useDragValue(endKnobContainerRef, {
    initialValue: externalRange?.[1] ?? maxValue,
    transform: mapEndDragValueToValue,
  })

  useEffect(() => {
    if (range[0] === startValue) return
    setRange([startValue, range[1]])
    onRangeChange?.(range)
  }, [startValue, range[0]])

  useEffect(() => {
    if (range[1] === endValue) return
    setRange([range[0], endValue])
    onRangeChange?.(range)
  }, [endValue, range[1]])

  useEffect(() => {
    if (isDraggingStartKnob || isDraggingEndKnob || isReleasingEndKnob || isDeepEqual(externalRange, range)) return
    setRange(externalRange ?? [minValue, maxValue])
    setStartValue(externalRange?.[0] ?? minValue)
    setEndValue(externalRange?.[1] ?? maxValue)
  }, [externalRange?.[0], externalRange?.[1], isDraggingStartKnob, isDraggingEndKnob, isReleasingEndKnob])

  useEffect(() => {
    if (!breakpoints) return
    setStartValue(getClosestSteppedValue(startValue, breakpoints))
  }, [isReleasingStartKnob, createKey(breakpoints)])

  useEffect(() => {
    if (!breakpoints || !isReleasingEndKnob) return
    setEndValue(getClosestSteppedValue(endValue, breakpoints))
  }, [isReleasingEndKnob, createKey(breakpoints)])

  return (
    <div
      {...props}
      ref={ref}
      aria-valuemax={maxValue}
      aria-valuemin={minValue}
      className={clsx(className, orientation)}
      role='slider'
    >
      <div ref={bodyRef} style={fixedStyles.body}>
        {cloneStyledElement(components.gutter ?? <RangeSliderGutter/>, {
          style: styles(fixedStyles.gutter),
        })}

        {cloneStyledElement(components.highlight ?? <RangeSliderHighlight/>, {
          style: styles(fixedStyles.highlight),
        })}

        {cloneStyledElement(components.knobContainer ?? <RangeSliderKnobContainer/>, {
          className: clsx({
            dragging: isDraggingStartKnob,
            releasing: isReleasingStartKnob,
          }),
          disabled: isDeepEqual([startValue, endValue], [maxValue, maxValue]),
          ref: startKnobContainerRef,
          style: styles(fixedStyles.knobContainer, {
            pointerEvents: isDeepEqual([startValue, endValue], [minValue, minValue]) ? 'none' : 'auto',
          }, orientation === 'horizontal' ? {
            left: `${start}px`,
          } : {
            top: `${start}px`,
          }),
        }, cloneStyledElement(components.knob ?? <RangeSliderKnob/>, {
          className: clsx({
            dragging: isDraggingStartKnob,
            releasing: isReleasingStartKnob,
          }),
          style: styles(fixedStyles.knob),
        }, <div style={fixedStyles.knobHitBox}/>, components.label && cloneStyledElement(components.label, {
          className: clsx({
            dragging: isDraggingStartKnob || isDraggingEndKnob,
            releasing: isReleasingStartKnob || isReleasingEndKnob,
          }),
          style: styles(fixedStyles.label),
        }, Number(startValue.toFixed(decimalPlaces)).toLocaleString())))}

        {cloneStyledElement(components.knobContainer ?? <RangeSliderKnobContainer/>, {
          className: clsx({
            dragging: isDraggingEndKnob,
            releasing: isDraggingEndKnob,
          }),
          disabled: isDeepEqual([startValue, endValue], [maxValue, maxValue]),
          style: styles(fixedStyles.knobContainer, {
            pointerEvents: isDeepEqual([startValue, endValue], [maxValue, maxValue]) ? 'none' : 'auto',
          }, orientation === 'horizontal' ? {
            left: `${end}px`,
          } : {
            top: `${end}px`,
          }),
          ref: endKnobContainerRef,
        }, cloneStyledElement(components.knob ?? <RangeSliderKnob/>, {
          className: clsx({
            dragging: isDraggingEndKnob,
            releasing: isDraggingEndKnob,
          }),
          style: styles(fixedStyles.knob),
        }, <div style={fixedStyles.knobHitBox}/>, components.label && cloneStyledElement(components.label, {
          className: clsx({
            dragging: isDraggingEndKnob,
            releasing: isReleasingEndKnob,
          }),
          style: styles(fixedStyles.label),
        }, Number(endValue.toFixed(decimalPlaces)).toLocaleString())))}
      </div>
    </div>
  )
})

/**
 * Component for the gutter of a {@link RangeSlider}.
 */
export const RangeSliderGutter = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

/**
 * Component for the label of a {@link RangeSlider}.
 */
export const RangeSliderLabel = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

/**
 * Component for the highlight of a {@link RangeSlider}.
 */
export const RangeSliderHighlight = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

/**
 * Component for the knob of a {@link RangeSlider}.
 */
export const RangeSliderKnob = ({ ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}/>
)

/**
 * Component for the container of the knob of a {@link RangeSlider}.
 */
export const RangeSliderKnobContainer = ({ ...props }: HTMLAttributes<HTMLButtonElement>) => (
  <button {...props}/>
)

function getFixedStyles({ orientation = 'horizontal', knobWidth = 0, knobHeight = 0, highlightLength = 0, start = 0, knobPadding = 0 }) {
  return asStyleDict({
    body: {
      height: '100%',
      width: '100%',
    },
    gutter: {
      display: 'block',
      top: '0',
      left: '0',
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    highlight: {
      left: '0',
      position: 'absolute',
      top: '0',
      ...orientation === 'horizontal' ? {
        height: '100%',
        width: `${highlightLength}px`,
        transform: `translate(${start}px, 0)`,
      } : {
        height: `${highlightLength}px`,
        width: '100%',
        transform: `translate(0, ${start}px)`,
      },
    },
    knobContainer: {
      background: 'none',
      border: 'none',
      outline: 'none',
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      zIndex: '1',
    },
    knob: {
      height: `${knobHeight}px`,
      touchAction: 'none',
      width: `${knobWidth}px`,
    },
    knobHitBox: {
      background: 'transparent',
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
  })
}

function getPositionByValue(value: number, min: number, max: number) {
  return (value - min) / (max - min)
}

function getPositionByDisplacement(displacement: number, orientation: RangeSliderOrientation, rect: Rect, knobWidth: number, knobHeight: number, isClipped: boolean) {
  switch (orientation) {
    case 'horizontal': {
      const maxWidth = isClipped ? rect.width - knobWidth : rect.width
      return (displacement - (isClipped ? knobWidth * 0.5 : 0)) / maxWidth
    }
    case 'vertical': {
      const maxHeight = isClipped ? rect.height - knobHeight : rect.height
      return (displacement - (isClipped ? knobHeight * 0.5 : 0)) / maxHeight
    }
    default:
      throw Error(`Invalid orientation: ${orientation}`)
  }
}

function getValueByPosition(position: number, min: number, max: number) {
  return position * (max - min) + min
}

function getValueByDisplacement(displacement: number, min: number, max: number, orientation: RangeSliderOrientation, rect: Rect, knobWidth: number, knobHeight: number, isClipped: boolean) {
  const position = getPositionByDisplacement(displacement, orientation, rect, knobWidth, knobHeight, isClipped)

  return getValueByPosition(position, min, max)
}

function getDisplacementByPosition(position: number, orientation: RangeSliderOrientation, rect: Rect, knobWidth: number, knobHeight: number, isClipped: boolean) {
  switch (orientation) {
    case 'horizontal': {
      const maxWidth = isClipped ? rect.width - knobWidth : rect.width
      return position * maxWidth + (isClipped ? knobWidth * 0.5 : 0)
    }
    case 'vertical': {
      const maxHeight = isClipped ? rect.height - knobHeight : rect.height
      return position * maxHeight + (isClipped ? knobHeight * 0.5 : 0)
    }
    default:
      throw Error(`Invalid orientation: ${orientation}`)
  }
}

function getDisplacementByValue(value: number, min: number, max: number, orientation: RangeSliderOrientation, rect: Rect, knobWidth: number, knobHeight: number, isClipped: boolean) {
  const position = getPositionByValue(value, min, max)

  return getDisplacementByPosition(position, orientation, rect, knobWidth, knobHeight, isClipped)
}

function getClosestSteppedValue(value: number, breakpoints: number[]) {
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

function createBreakpoints(min: number, max: number, steps: number): number[] | undefined {
  if (steps < 0) return undefined

  return [
    min,
    ...[...Array(steps)].map((_, i) => min + (i + 1) * (max - min) / (1 + steps)),
    max,
  ]
}

if (process.env.NODE_ENV !== 'production') {
  RangeSlider.displayName = 'RangeSlider'
  RangeSliderGutter.displayName = 'RangeSliderGutter'
  RangeSliderLabel.displayName = 'RangeSliderLabel'
  RangeSliderHighlight.displayName = 'RangeSliderHighlight'
  RangeSliderKnob.displayName = 'RangeSliderKnob'
}
