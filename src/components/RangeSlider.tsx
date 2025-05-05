import clsx from 'clsx'
import isDeepEqual from 'fast-deep-equal/react'
import { forwardRef, useCallback, useEffect, useRef, useState, type HTMLAttributes } from 'react'
import type { Rect } from 'spase'
import { useDragValue, useRect } from '../hooks/index.js'
import { asComponentDict, asStyleDict, cloneStyledElement, createKey, styles } from '../utils/index.js'

type Orientation = 'horizontal' | 'vertical'

type Range = [number, number]

export type RangeSliderProps = Omit<HTMLAttributes<HTMLDivElement>, 'aria-valuemax' | 'aria-valuemin' | 'role'> & {
  decimalPlaces?: number
  isClipped?: boolean
  knobHeight?: number
  knobPadding?: number
  knobWidth?: number
  max: number
  min: number
  orientation?: Orientation
  range?: Range
  steps?: number
  onRangeChange?: (range: Range) => void
}

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
  const startKnobRef = useRef<HTMLDivElement>(null)
  const endKnobRef = useRef<HTMLDivElement>(null)
  const [range, setRange] = useState<Range>(externalRange ?? [minValue, maxValue])

  const mapStartDragValueToValue = useCallback((value: number, dx: number, dy: number) => {
    const delta = orientation === 'horizontal' ? dx : dy
    const dMin = getDisplacementByValue(minValue, minValue, maxValue, orientation, bodyRect)
    const dMax = getDisplacementByValue(range[1], minValue, maxValue, orientation, bodyRect)
    const dCurr = getDisplacementByValue(value, minValue, maxValue, orientation, bodyRect) + delta

    return getValueByDisplacement(Math.max(dMin, Math.min(dMax, dCurr)), minValue, maxValue, orientation, bodyRect)
  }, [minValue, maxValue, orientation, range[1], createKey(bodyRect.toJSON())])

  const mapEndDragValueToValue = useCallback((value: number, dx: number, dy: number) => {
    const delta = orientation === 'horizontal' ? dx : dy
    const dMin = getDisplacementByValue(range[0], minValue, maxValue, orientation, bodyRect)
    const dMax = getDisplacementByValue(maxValue, minValue, maxValue, orientation, bodyRect)
    const dCurr = getDisplacementByValue(value, minValue, maxValue, orientation, bodyRect) + delta

    return getValueByDisplacement(Math.max(dMin, Math.min(dMax, dCurr)), minValue, maxValue, orientation, bodyRect)
  }, [minValue, maxValue, orientation, range[0], createKey(bodyRect.toJSON())])

  const { isDragging: isDraggingStartKnob, isReleasing: isReleasingStartKnob, value: startValue, setValue: setStartValue } = useDragValue(startKnobRef, {
    initialValue: externalRange?.[0] ?? minValue,
    transform: mapStartDragValueToValue,
  })

  const { isDragging: isDraggingEndKnob, isReleasing: isReleasingEndKnob, value: endValue, setValue: setEndValue } = useDragValue(endKnobRef, {
    initialValue: externalRange?.[1] ?? maxValue,
    transform: mapEndDragValueToValue,
  })

  const breakpoints = [minValue, ...[...Array(steps)].map((_, i) => minValue + (i + 1) * (maxValue - minValue) / (1 + steps)), maxValue]
  const [start, end] = range.map(t => getDisplacementByValue(t, minValue, maxValue, orientation, bodyRect))
  const highlightLength = end - start

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
    if (isDraggingStartKnob || isDraggingEndKnob || isDeepEqual(externalRange, range)) return
    setRange(externalRange ?? [minValue, maxValue])
    setStartValue(externalRange?.[0] ?? minValue)
    setEndValue(externalRange?.[1] ?? maxValue)
  }, [externalRange?.[0], externalRange?.[1]])

  useEffect(() => {
    if (steps < 0) return
    setStartValue(getClosestSteppedValue(startValue, breakpoints))
  }, [steps, isReleasingStartKnob, createKey(breakpoints)])

  useEffect(() => {
    if (steps < 0 || !isReleasingEndKnob) return
    setEndValue(getClosestSteppedValue(endValue, breakpoints))
  }, [steps, isReleasingEndKnob, createKey(breakpoints)])

  const components = asComponentDict(children, {
    gutter: RangeSliderGutter,
    highlight: RangeSliderHighlight,
    knob: RangeSliderKnob,
    label: RangeSliderLabel,
  })

  const fixedStyles = getFixedStyles({ orientation, highlightLength, start, knobPadding, knobWidth, knobHeight })

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
        {cloneStyledElement(components.knob ?? <RangeSliderKnob
          style={styles({
            transitionProperty: isReleasingStartKnob ? 'opacity, transform' : 'opacity',
          })}
        />, {
          ref: startKnobRef,
          disabled: isDeepEqual([startValue, endValue], [maxValue, maxValue]),
          className: clsx({
            dragging: isDraggingStartKnob,
            releasing: isReleasingStartKnob,
          }),
          style: styles(fixedStyles.knob, {
            pointerEvents: isDeepEqual([startValue, endValue], [minValue, minValue]) ? 'none' : 'auto',
          }, orientation === 'horizontal' ? {
            marginTop: `${-knobHeight / 2 + bodyRect.height / 2}px`,
            marginLeft: `${start - knobWidth / 2}px`,
          } : {
            marginTop: `${start - knobHeight / 2}px`,
            marginLeft: `${-knobWidth / 2 + bodyRect.width / 2}px`,
          }),
        }, <div style={fixedStyles.knobHitBox}/>, components.label && cloneStyledElement(components.label, {
          className: clsx({
            dragging: isDraggingStartKnob || isDraggingEndKnob,
            releasing: isReleasingStartKnob || isReleasingEndKnob,
          }),
          style: styles(fixedStyles.label),
        }, Number(startValue.toFixed(decimalPlaces)).toLocaleString()))}
        {cloneStyledElement(components.knob ?? <RangeSliderKnob
          style={styles({
            transitionProperty: isReleasingEndKnob ? 'opacity, transform' : 'opacity',
          })}
        />, {
          ref: endKnobRef,
          disabled: isDeepEqual([startValue, endValue], [maxValue, maxValue]),
          className: clsx({
            dragging: isDraggingEndKnob,
            releasing: isDraggingEndKnob,
          }),
          style: styles(fixedStyles.knob, {
            pointerEvents: isDeepEqual([startValue, endValue], [maxValue, maxValue]) ? 'none' : 'auto',
          }, orientation === 'horizontal' ? {
            marginTop: `${-knobHeight / 2 + bodyRect.height / 2}px`,
            marginLeft: `${end - knobWidth / 2}px`,
          } : {
            marginTop: `${end - knobHeight / 2}px`,
            marginLeft: `${-knobWidth / 2 + bodyRect.width / 2}px`,
          }),
        }, <div style={fixedStyles.knobHitBox}/>, components.label && cloneStyledElement(components.label, {
          className: clsx({
            dragging: isDraggingEndKnob,
            releasing: isReleasingEndKnob,
          }),
          style: styles(fixedStyles.label),
        }, Number(endValue.toFixed(decimalPlaces)).toLocaleString()))}
      </div>
    </div>
  )
})

export const RangeSliderGutter = /* #__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => (
  <div {...props} ref={ref}/>
))

export const RangeSliderLabel = /* #__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => (
  <div {...props} ref={ref}/>
))

export const RangeSliderHighlight = /* #__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => (
  <div {...props} ref={ref}/>
))

export const RangeSliderKnob = /* #__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => (
  <div {...props} ref={ref}/>
))

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
      height: '100%',
      left: '0',
      position: 'absolute',
      top: '0',
      ...orientation === 'horizontal' ? {
        width: `${highlightLength}px`,
        transform: `translate3d(${start}px, 0, 0)`,
      } : {
        height: `${highlightLength}px`,
        transform: `translate3d(0, ${start}px, 0)`,
      },
    },
    knob: {
      bottom: '0',
      left: '0',
      margin: 'auto',
      position: 'absolute',
      right: '0',
      width: `${knobWidth}px`,
      height: `${knobHeight}px`,
      top: '0',
      touchAction: 'none',
      zIndex: '1',
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

function getPositionByDisplacement(displacement: number, orientation: Orientation, rect: Rect) {
  return displacement / (orientation === 'horizontal' ? rect.width : rect.height)
}

function getValueByPosition(position: number, min: number, max: number) {
  return position * (max - min) + min
}

function getValueByDisplacement(displacement: number, min: number, max: number, orientation: Orientation, rect: Rect) {
  return getValueByPosition(getPositionByDisplacement(displacement, orientation, rect), min, max)
}

function getDisplacementByPosition(position: number, orientation: Orientation, rect: Rect) {
  return position * (orientation === 'horizontal' ? rect.width : rect.height)
}

function getDisplacementByValue(value: number, min: number, max: number, orientation: Orientation, rect: Rect) {
  return getDisplacementByPosition(getPositionByValue(value, min, max), orientation, rect)
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

RangeSlider.displayName = 'RangeSlider'
