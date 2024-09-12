import clsx from 'clsx'
import isDeepEqual from 'fast-deep-equal/react'
import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type PropsWithChildren } from 'react'
import { useDragValueEffect } from '../hooks/useDragValueEffect.js'
import { useRect } from '../hooks/useRect.js'
import { asComponentDict, asStyleDict, cloneStyledElement, styles } from '../utils/index.js'

type Orientation = 'horizontal' | 'vertical'

type Range = [number, number]

export type RangeSliderProps = PropsWithChildren<{
  decimalPlaces?: number
  knobHeight?: number
  knobPadding?: number
  knobWidth?: number
  max: number
  min: number
  orientation?: Orientation
  range?: Range
  steps?: number
  onRangeChange?: (range: Range) => void
}>

export const RangeSlider = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & RangeSliderProps>(({
  children,
  className,
  decimalPlaces = 2,
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
  const getPositionByValue = (value: number) => (value - minValue) / (maxValue - minValue)
  const getPositionByDisplacement = (displacement: number) => displacement / (orientation === 'horizontal' ? bodyRect.width : bodyRect.height)
  const getValueByPosition = (position: number) => position * (maxValue - minValue) + minValue
  const getValueByDisplacement = (displacement: number) => getValueByPosition(getPositionByDisplacement(displacement))
  const getDisplacementByPosition = (position: number) => position * (orientation === 'horizontal' ? bodyRect.width : bodyRect.height)
  const getDisplacementByValue = (value: number) => getDisplacementByPosition(getPositionByValue(value))

  const getClosestSteppedValue = (value: number) => {
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

  const bodyRef = useRef<HTMLDivElement>(null)
  const bodyRect = useRect(bodyRef)
  const startKnobRef = useRef<HTMLDivElement>(null)
  const endKnobRef = useRef<HTMLDivElement>(null)
  const [range, setRange] = useState<Range>(externalRange ?? [minValue, maxValue])

  const { isDragging: [isDraggingStartKnob], isReleasing: [isReleasingStartKnob], value: [startValue, setStartValue] } = useDragValueEffect(startKnobRef, {
    initialValue: externalRange?.[0] ?? minValue,
    transform: (value: number, dx: number, dy: number) => {
      const delta = orientation === 'horizontal' ? dx : dy
      const dMin = getDisplacementByValue(minValue)
      const dMax = getDisplacementByValue(range[1])
      const dCurr = getDisplacementByValue(value) + delta

      return getValueByDisplacement(Math.max(dMin, Math.min(dMax, dCurr)))
    },
  }, [minValue, orientation, bodyRect.size.width, bodyRect.size.height, range[1]])

  const { isDragging: [isDraggingEndKnob], isReleasing: [isReleasingEndKnob], value: [endValue, setEndValue] } = useDragValueEffect(endKnobRef, {
    initialValue: externalRange?.[1] ?? maxValue,
    transform: (value: number, dx: number, dy: number) => {
      const delta = orientation === 'horizontal' ? dx : dy
      const dMin = getDisplacementByValue(range[0])
      const dMax = getDisplacementByValue(maxValue)
      const dCurr = getDisplacementByValue(value) + delta

      return getValueByDisplacement(Math.max(dMin, Math.min(dMax, dCurr)))
    },
  }, [maxValue, orientation, bodyRect.size.width, bodyRect.size.height, range[0]])

  const breakpoints = [minValue, ...[...Array(steps)].map((v, i) => minValue + (i + 1) * (maxValue - minValue) / (1 + steps)), maxValue]
  const [start, end] = range.map(getDisplacementByValue)
  const highlightLength = end - start

  useEffect(() => {
    if (range[0] === startValue) return
    setRange([startValue, range[1]])
    onRangeChange?.(range)
  }, [startValue])

  useEffect(() => {
    if (range[1] === endValue) return
    setRange([range[0], endValue])
    onRangeChange?.(range)
  }, [endValue])

  useEffect(() => {
    if (isDraggingStartKnob || isDraggingEndKnob || isDeepEqual(externalRange, range)) return
    setRange(externalRange ?? [minValue, maxValue])
    setStartValue(externalRange?.[0] ?? minValue)
    setEndValue(externalRange?.[1] ?? maxValue)
  }, [externalRange?.[0], externalRange?.[1]])

  useEffect(() => {
    if (steps < 0) return
    setStartValue(getClosestSteppedValue(startValue))
  }, [isReleasingStartKnob])

  useEffect(() => {
    if (steps < 0 || !isReleasingEndKnob) return
    setEndValue(getClosestSteppedValue(endValue))
  }, [isReleasingEndKnob])

  const components = asComponentDict(children, {
    gutter: RangeSliderGutter,
    highlight: RangeSliderHighlight,
    knob: RangeSliderKnob,
    label: RangeSliderLabel,
  })

  const fixedStyles = getFixedStyles({ orientation, highlightLength, start, knobPadding, knobWidth, knobHeight })

  return (
    <div {...props} ref={ref} className={clsx(className, orientation)}>
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
        }, <div style={fixedStyles.knobHitbox}/>, components.label && cloneStyledElement(components.label, {
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
        }, <div style={fixedStyles.knobHitbox}/>, components.label && cloneStyledElement(components.label, {
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

export const RangeSliderGutter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => (
  <div {...props} ref={ref}/>
))

export const RangeSliderLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => (
  <div {...props} ref={ref}/>
))

export const RangeSliderHighlight = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => (
  <div {...props} ref={ref}/>
))

export const RangeSliderKnob = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ ...props }, ref) => (
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
    knobHitbox: {
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

Object.defineProperty(RangeSlider, 'displayName', { value: 'RangeSlider', writable: false })
